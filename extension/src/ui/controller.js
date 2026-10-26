import { draftRecord, filenameFor, MAX_MARKDOWN, textStats } from '../model.js';
import { ACCEPT_ATTRIBUTE, MAX_QUEUE_FILES, splitFileName, validateUpload } from '../../../frontend/lib/formats.js';

export async function mountPanel(doc, api) {
  const el = id => doc.getElementById(id);
  let draft = null;
  let busy = false;
  let ready = false;
  let revision = 0;
  let saveTimer;
  let queue = [];
  let uploadAbort;
  let target = null;
  let targetRevision = 0;
  let activeItem = null;
  let clearFailed = false;
  const status = (text, error = false) => { el('status').textContent = text; el('status').dataset.error = String(error); };
  const update = () => {
    const hasDraft = draft !== null;
    el('clear').disabled = !hasDraft && !busy && !queue.length && !clearFailed;
    el('copy').disabled = !hasDraft; el('download').disabled = !hasDraft;
    el('paste').disabled = busy || !hasDraft || !el('editor').value.trim() || !target;
    el('paste').textContent = target ? `Paste into ${target.label}` : 'Paste into AI';
    el('choose-files').disabled = !ready || busy;
    el('profile').disabled = busy;
    const waiting = queue.filter(item => ['pending','retry'].includes(item.state));
    el('convert-files').disabled = !ready || busy || !waiting.length;
    el('convert-files').textContent = waiting.length && waiting.every(item => item.checkpoint) ? 'Resume files' : 'Convert files';
    el('editor').disabled = !hasDraft;
    el('busy').hidden = !busy;
    el('empty').hidden = hasDraft;
    el('document').hidden = !hasDraft;
    const counts = textStats(hasDraft ? el('editor').value : '');
    el('characters').textContent = counts.characters.toLocaleString();
    el('words').textContent = counts.words.toLocaleString();
    el('tokens').textContent = counts.tokens.toLocaleString();
  };
  const current = () => draft ? draftRecord({ ...draft, markdown: el('editor').value }) : null;
  const persist = async () => {
    clearTimeout(saveTimer);
    const snapshot = current();
    if (!snapshot) return false;
    try { await api.saveDraft(snapshot); return true; }
    catch { status('The draft could not be saved for this session. Copy or download it before closing the popup.', true); return false; }
  };
  const showDraft = (value, item = null) => {
    activeItem = item;
    draft = value;
    el('editor').value = value?.markdown || '';
    el('document-title').textContent = value?.title || 'Untitled file';
    el('warnings').replaceChildren();
    for (const warning of value?.warnings || []) {
      const li = doc.createElement('li'); li.textContent = warning; el('warnings').appendChild(li);
    }
    update();
    if (value) el('document').scrollIntoView?.({ block: 'start' });
  };
  const renderQueue = () => {
    el('file-queue').replaceChildren();
    for (const item of queue) {
      const row = doc.createElement('li'); row.dataset.state = item.state;
      const name = doc.createElement('strong'); name.textContent = item.name;
      const message = doc.createElement('span'); message.textContent = item.message;
      row.append(name, message);
      if (item.result) {
        const review = doc.createElement('button'); review.textContent = 'Review'; review.disabled = busy;
        review.addEventListener('click', async () => { showDraft(item.result, item); await persist(); });
        row.appendChild(review);
      }
      el('file-queue').appendChild(row);
    }
    update();
  };
  const addFiles = files => {
    if (busy || !ready) return;
    if (files.length + queue.length > MAX_QUEUE_FILES) { status('Choose up to 20 files. Clear the queue before adding more.', true); return; }
    for (const file of files) {
      const invalid = validateUpload(file);
      queue.push({ file: invalid ? null : file, name: file.name, state: invalid ? 'error' : 'pending', message: invalid || 'Ready to upload' });
    }
    renderQueue(); status('Review your files and profile, then click Convert files to upload.');
  };
  el('files').accept = ACCEPT_ATTRIBUTE;
  el('choose-files').addEventListener('click', () => el('files').click());
  el('files').addEventListener('change', () => { addFiles([...el('files').files]); el('files').value = ''; });
  // Prevent a dropped file from replacing the popup document.
  doc.addEventListener('dragover', event => event.preventDefault());
  doc.addEventListener('drop', event => event.preventDefault());
  el('dropzone').addEventListener('dragover', event => { event.preventDefault(); if (!busy) el('dropzone').classList.add('dragging'); });
  el('dropzone').addEventListener('dragleave', () => el('dropzone').classList.remove('dragging'));
  el('dropzone').addEventListener('drop', event => {
    event.preventDefault(); el('dropzone').classList.remove('dragging');
    addFiles([...event.dataTransfer.files]);
  });
  el('convert-files').addEventListener('click', async () => {
    if (!ready || busy) return;
    const attempt = ++revision;
    busy = true; clearTimeout(saveTimer); renderQueue();
    uploadAbort = new AbortController();
    const signal = uploadAbort.signal;
    const profile = el('profile').value;
    let sessionSaveFailed = false;
    try {
      // Called directly from the click gesture so Chrome can show its optional
      // permission prompt. Denial sends no file or job metadata.
      const granted = await api.authorizeUploads();
      if (attempt !== revision) return;
      if (!granted) { status('File-converter access was not granted. Your files were not uploaded.', true); return; }
      for (const item of queue.filter(value => ['pending','retry'].includes(value.state))) {
        if (attempt !== revision) break;
        item.state = 'running'; item.message = 'Starting…'; renderQueue();
        status(`Converting ${item.name}…`);
        try {
          const options = { signal, onCheckpoint: async checkpoint => {
            if (attempt !== revision) throw new DOMException('Aborted','AbortError');
            await api.savePendingJob(checkpoint);
            if (attempt !== revision) throw new DOMException('Aborted','AbortError');
            item.checkpoint = checkpoint;
          }, onProgress: message => {
            if (attempt === revision) { item.message = message; renderQueue(); }
          } };
          const value = item.checkpoint ? await api.resumeUpload(item.checkpoint, options) : await api.convertUpload(item.file, profile, options);
          if (attempt !== revision) break;
          const validated = draftRecord(value);
          if (!validated) throw new Error('The result is too large for this editor. Use the web app for this file.');
          item.result = validated; item.file = null; item.state = 'done'; item.message = 'Converted — review, download or paste';
          showDraft(validated, item);
          if (!await persist()) sessionSaveFailed = true;
          else if (item.checkpoint) {
            try { await api.removePendingJob(item.checkpoint.jobId); item.checkpoint = null; }
            catch { sessionSaveFailed = true; }
          }
        } catch (error) {
          if (attempt !== revision) break;
          item.state = item.checkpoint ? 'retry' : 'error'; item.file = null;
          item.message = error.name === 'AbortError' ? 'Stopped waiting. An uploaded job may still finish on the server.' : (error.message || 'Conversion failed.');
        }
        renderQueue();
      }
      if (attempt === revision) {
        const failed = queue.filter(item => ['error','retry'].includes(item.state)).length;
        status(sessionSaveFailed ? 'Converted results are available, but session saving failed. Export them before closing this popup.' : failed ? `${failed} file(s) could not finish. Resume uploaded jobs, or choose interrupted files again.` : 'Files converted. Review your Markdown, then download or paste.', sessionSaveFailed || failed > 0);
      }
    } catch { if (attempt === revision) status('Chrome could not grant file-converter access. No new upload was started.', true); }
    finally { if (attempt === revision) { busy = false; uploadAbort = null; renderQueue(); } }
  });
  const detectTarget = async () => {
    const attempt = ++targetRevision;
    let value = null;
    try { value = await api.detectAI(); } catch { /* No activeTab grant yet. */ }
    if (attempt !== targetRevision) return;
    target = value;
    el('ai-target').textContent = target ? `${target.label} detected` : 'No supported AI tab detected';
    update();
  };
  el('detect-ai').addEventListener('click', detectTarget);
  el('paste').addEventListener('click', async () => {
    const snapshot = current(); if (!snapshot?.markdown.trim()) return;
    try {
      const label = await api.paste(snapshot.markdown);
      status(`Pasted into ${label}. Review it in the chat; nothing was sent.`);
    } catch (error) { status(error.message || 'Could not paste. Copy the Markdown and paste manually.', true); }
    await detectTarget();
  });
  el('editor').maxLength = MAX_MARKDOWN;
  el('editor').addEventListener('input', () => {
    if (activeItem) activeItem.result = current();
    update(); clearTimeout(saveTimer); saveTimer = setTimeout(persist, 300);
  });
  el('clear').addEventListener('click', async () => {
    const wasUploading = Boolean(uploadAbort);
    ++revision; clearTimeout(saveTimer); uploadAbort?.abort(); uploadAbort = null;
    busy = false; queue = []; clearFailed = false; renderQueue(); showDraft(null);
    try { await api.clearDraft(); status(wasUploading ? 'Local draft and queue cleared. Uploaded jobs may still finish; server retention still applies.' : 'Draft and queue cleared from this browser session.'); }
    catch { clearFailed = true; status('The popup was cleared, but Chrome could not clear its saved session data. Try Clear again.', true); update(); }
  });
  el('copy').addEventListener('click', async () => {
    const snapshot = current(); if (!snapshot) return;
    try { await api.copy(snapshot.markdown); status('Markdown copied.'); }
    catch { status('Clipboard access failed. Select the Markdown and press Ctrl+C (or ⌘C).', true); }
  });
  el('download').addEventListener('click', () => {
    const snapshot = current(); if (!snapshot) return;
    try { api.download(snapshot.markdown, filenameFor(snapshot.mode === 'file' ? splitFileName(snapshot.title).stem : snapshot.title)); status('Markdown download started.'); }
    catch { status('The download could not start. Copy the Markdown instead.', true); }
  });
  update();
  try {
    showDraft(await api.loadDraft());
    const jobs = await api.loadPendingJobs();
    queue = jobs.map(checkpoint => ({ checkpoint, name: checkpoint.filename, state: 'pending',
      message: checkpoint.phase === 'processing' ? 'Uploaded job — ready to resume' : 'Interrupted upload — check or choose this file again', file: null }));
    renderQueue();
    status(jobs.length ? 'Restored uploaded jobs. Click Resume files to retrieve them without another upload.' : draft ? 'Restored your draft from this browser session.' : 'Choose or drop files to convert.');
  }
  catch { status('Session storage is unavailable. Copy or download any available Markdown before closing.', true); }
  ready = true; update();
  await detectTarget();
  const unsubscribe = api.onTargetChange?.(detectTarget);
  doc.defaultView?.addEventListener('pagehide', () => { void persist(); uploadAbort?.abort(); unsubscribe?.(); }, { once: true });
  return { flush: persist };
}
