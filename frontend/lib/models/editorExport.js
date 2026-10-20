// Take pending edits before browser exports read the debounced owner state.
// A reader drains its timer and returns the exact edit plus a commit callback.
// Drain every mounted reader first, then commit in typing order: responsive
// layouts may briefly have pending buffers for the same document.
export function snapshotWithPendingEdits(snapshot, readers) {
  const edits = [];
  for (const takePending of readers) {
    const edit = takePending();
    if (edit) edits.push(edit);
  }
  if (!edits.length) return snapshot;
  edits.sort((a, b) => a.revision - b.revision);
  const latest = new Map();
  for (const edit of edits) {
    edit.commit();
    latest.set(edit.docId, edit.content);
  }
  const apply = result => result && latest.has(result.id)
    ? { ...result, content: latest.get(result.id) }
    : result;
  return { ...snapshot, activeResult: apply(snapshot.activeResult), results: snapshot.results.map(apply) };
}
