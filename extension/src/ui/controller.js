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
  const status = (text, error = false) => { el('status').textContent = text; el('status').dataset.error = String(error); };
  const update = () => {
    const hasDraft = draft !== null;
    for (const id of ['capture-page','capture-selection']) el(id).disabled = !ready || busy;
    el('clear').disabled = !hasDraft && !busy && !queue.length;
    el('copy').disabled = !hasDraft; el('download').disabled = !hasDraft;
    el('paste').disabled = busy || !hasDraft || !el('editor').value.trim() || !target;
    el('paste').textContent = target ? `Paste into ${target.label}` : 'Paste into AI';
    el('choose-files').disabled = !ready || busy;
    el('profile').disabled = busy;
    el('convert-files').disabled = !ready || busy || !queue.some(item => item.state === 'pending');
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
    catch { status('The draft could not be saved for this session. Copy or download it before closing the panel.', true); return false; }
  };
  const showDraft = (value, item = null) => {
    activeItem = item;
    draft = value;
    el('editor').value = value?.markdown || '';
    el('document-title').textContent = value?.title || 'Untitled page';
    el('source').textContent = value?.sourceUrl || '';
    el('source').removeAttribute('href');
    if (value?.sourceUrl) el('source').href = value.sourceUrl;
    el('warnings').replaceChildren();
    for (const warning of value?.warnings || []) {
      const li = doc.createElement('li'); li.textContent = warning; el('warnings').appendChild(li);
    }
    update();
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
  // Prevent a dropped file from replacing the panel document.
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
      for (const item of queue.filter(value => value.state === 'pending')) {
        if (attempt !== revision) break;
        item.state = 'running'; item.message = 'Starting…'; renderQueue();
        status(`Converting ${item.name}…`);
        try {
          const value = await api.convertUpload(item.file, profile, { signal, onProgress: message => {
            if (attempt === revision) { item.message = message; renderQueue(); }
          } });
          if (attempt !== revision) break;
          const validated = draftRecord(value);
          if (!validated) throw new Error('The result is too large for this editor. Use the web app for this file.');
          item.result = validated; item.file = null; item.state = 'done'; item.message = 'Converted — review, download or paste';
          showDraft(validated, item); if (!await persist()) sessionSaveFailed = true;
        } catch (error) {
          if (attempt !== revision) break;
          item.state = 'error'; item.file = null;
          item.message = error.name === 'AbortError' ? 'Stopped waiting. An uploaded job may still finish on the server.' : (error.message || 'Conversion failed.');
        }
        renderQueue();
      }
      if (attempt === revision) {
        const failed = queue.filter(item => item.state === 'error').length;
        status(sessionSaveFailed ? 'Converted results are available, but session saving failed. Export them before closing this panel.' : failed ? `${failed} file(s) could not be converted. Review the queue; choose them again to retry.` : 'Files converted. Review your Markdown, then download or paste.', sessionSaveFailed || failed > 0);
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
  const capture = async mode => {
    if (!ready || busy) return;
    clearTimeout(saveTimer);
    const attempt = ++revision;
    busy = true; update(); status('Reading the current page locally…');
    try {
      const value = await api.capture({ mode, includeSource: el('include-source').checked, includeImages: el('include-images').checked });
      if (attempt !== revision) return;
      const validated = draftRecord(value);
      if (!validated) throw new Error('The result is too large. Select a smaller section.');
      showDraft(validated);
      const saved = await persist();
      if (attempt === revision && saved) status(mode === 'selection' ? 'Selection captured. Review and edit your Markdown.' : 'Page captured. Review and edit your Markdown.');
    } catch (error) { if (attempt === revision) status(error.message || 'Capture failed. Try again.', true); }
    finally { if (attempt === revision) { busy = false; update(); } }
  };
  el('editor').maxLength = MAX_MARKDOWN;
  el('editor').addEventListener('input', () => {
    if (activeItem) activeItem.result = current();
    update(); clearTimeout(saveTimer); saveTimer = setTimeout(persist, 300);
  });
  el('capture-page').addEventListener('click', () => capture(el('scope').value));
  el('capture-selection').addEventListener('click', () => capture('selection'));
  el('clear').addEventListener('click', async () => {
    const wasUploading = Boolean(uploadAbort);
    ++revision; clearTimeout(saveTimer); uploadAbort?.abort(); uploadAbort = null;
    busy = false; queue = []; renderQueue(); showDraft(null);
    try { await api.clearDraft(); status(wasUploading ? 'Local draft and queue cleared. Uploaded jobs may still finish; server retention still applies.' : 'Draft and queue cleared from this browser session.'); }
    catch { status('The panel was cleared, but Chrome could not clear the saved session draft. Try Clear again before closing Chrome.', true); el('clear').disabled = false; }
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
  try { showDraft(await api.loadDraft()); status(draft ? 'Restored your draft from this browser session.' : 'Choose or drop files to convert, or capture page text below.'); }
  catch { status('Session storage is unavailable. You can still capture and export from this panel.', true); }
  ready = true; update();
  await detectTarget();
  const unsubscribe = api.onTargetChange?.(detectTarget);
  doc.defaultView?.addEventListener('pagehide', () => { uploadAbort?.abort(); unsubscribe?.(); }, { once: true });
  return { flush: persist };
}
