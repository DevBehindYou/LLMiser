// Page merging/export collection are independent of React and testable with delayed requests.
export const DETAIL_SECTIONS = ['files', 'nodes', 'items', 'events'];
export const DETAIL_IDS = { files: 'file_id', nodes: 'node_id', items: 'work_item_id', events: 'event_id' };

export function mergeDetailPage(detail, section, page) {
  if (!DETAIL_SECTIONS.includes(section) || page.section !== section) throw new Error('Invalid detail page');
  const records = new Map((detail[section] || []).map(row => [row[DETAIL_IDS[section]], row]));
  for (const row of page.rows) records.set(row[DETAIL_IDS[section]], row);
  const { rows, section: _section, ...metadata } = page;
  return { ...detail, [section]: [...records.values()], pages: { ...detail.pages, [section]: metadata } };
}

/** Resolve every active registered file before signing/downloading a ZIP. */
export async function collectStoredFiles(jobIds, { loadPage, outputsOnly = false, maxFiles = 200, signal } = {}) {
  const files = [];
  const ids = [...new Set(jobIds)];
  for (const jobId of ids) {
    let cursor = null;
    const seenCursors = new Set();
    const seenFiles = new Set();
    const priorFiles = files.length;
    let expectedTotal = null;
    do {
      signal?.throwIfAborted();
      const page = await loadPage(jobId, 'files', { limit: 100, cursor, stored: '1', ...(outputsOnly ? { kind: 'OUTPUT' } : {}) }, signal);
      signal?.throwIfAborted();
      if (page.section !== 'files' || !Array.isArray(page.rows) || !Number.isSafeInteger(page.total) || page.total < page.rows.length) throw new Error('Could not load the complete file list');
      if (expectedTotal !== null && page.total !== expectedTotal) throw new Error('Stored files changed. Refresh and try again.');
      expectedTotal = page.total;
      if (page.total + priorFiles > maxFiles) throw new Error(`At most ${maxFiles} files per ZIP`);
      for (const file of page.rows) {
        if (seenFiles.has(file.file_id)) throw new Error('Stored files changed. Refresh and try again.');
        seenFiles.add(file.file_id);
        if (file.storage_status !== 'ACTIVE' || (outputsOnly && file.kind !== 'OUTPUT')) throw new Error('Stored files changed. Refresh and try again.');
        files.push({ jobId, fileId: file.file_id, name: `${ids.length > 1 ? jobId.slice(0, 8) : file.kind.toLowerCase()}/${file.object_path.split('/').pop()}` });
        if (files.length > maxFiles) throw new Error(`At most ${maxFiles} files per ZIP`);
      }
      if (page.next && (seenCursors.has(page.next) || !page.rows.length)) throw new Error('Could not load the complete file list');
      if (page.next) seenCursors.add(page.next);
      cursor = page.next;
    } while (cursor);
    if (seenFiles.size !== expectedTotal) throw new Error('Could not load the complete file list');
  }
  return files;
}
