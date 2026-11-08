#!/usr/bin/env node
// M09 fixture: runs the real, browser-independent export and session code.
//   - snapshotWithPendingEdits (lib/models/editorExport.js): what an export reads
//     when the reader still holds an unsaved edit
//   - uniqueArchiveNames (lib/models/fileExport.js): ZIP entry names for two
//     sources that both convert to report.md
//   - saveRecentSession / getRecentSessions (lib/models/sessionRepository.js)
//     with an in-memory localStorage: what a recent session stores after a
//     conversion, and whether a later edit changes it
//   - AUTOMATIC_PREVIEW_LIMIT is read from source (MarkdownViewer.js imports React).
// Writes export-behavior.json. LOCAL CODE-LEVEL RUN; no browser, no network.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { snapshotWithPendingEdits } from '../../../../frontend/lib/models/editorExport.js';
import { uniqueArchiveNames } from '../../../../frontend/lib/models/fileExport.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.resolve(HERE, '../../../../frontend');

// In-memory localStorage before the session module reads it.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const sessions = await import('../../../../frontend/lib/models/sessionRepository.js');

const original = '# Report\n\nTotal: 4,167.51\n';
const edited = '# Report\n\nTotal: 4,167.51 (USD, checked against the scan)\n';
const state = {
  activeResult: { id: 'a', filename: 'report.md', content: original },
  results: [
    { id: 'a', filename: 'report.md', content: original },
    { id: 'b', filename: 'report.md', content: '# Report (Word)\n' },
    { id: 'c', filename: 'notes.md', content: '# Notes\n' },
  ],
};
let committed = false;
const reader = () => ({ docId: 'a', revision: 1, content: edited, commit: () => { committed = true; } });
const snap = snapshotWithPendingEdits(state, [reader]);

sessions.saveRecentSession({ id: 'a', filename: 'report.md', original_name: 'report.pdf', content: original, tokens_est: 6 });
const afterConversion = sessions.getRecentSessions();
// The converter does not save a session on edits (contentUpdated never calls saveSession).
const afterEdit = sessions.getRecentSessions();

const viewer = fs.readFileSync(path.join(FRONTEND, 'components/MarkdownViewer.js'), 'utf8');
const limit = Number(/AUTOMATIC_PREVIEW_LIMIT = (\d+)/.exec(viewer)[1]);

const result = {
  label: 'LOCAL CODE-LEVEL RUN of frontend export/session models; no browser',
  date: new Date().toISOString(),
  export_snapshot: {
    active_content_exported: snap.activeResult.content,
    includes_pending_edit: snap.activeResult.content === edited,
    pending_edit_committed: committed,
    other_documents_unchanged: snap.results[1].content === state.results[1].content,
  },
  zip_entry_names: uniqueArchiveNames(state.results.map((r) => r.filename)),
  zip_file_name: 'llmiser-converted.zip (default in downloadMarkdownZip)',
  recent_session: {
    max_sessions: sessions.MAX_SESSIONS,
    stored_content_after_conversion: afterConversion[0]?.content,
    stored_content_after_edit: afterEdit[0]?.content,
    edit_reflected_in_session: afterEdit[0]?.content === edited,
  },
  automatic_preview_limit_utf16_units: limit,
};
fs.writeFileSync(path.join(HERE, 'export-behavior.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
