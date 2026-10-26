// Durable identity only. Signed download URLs must never enter browser history.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resultReference(result) {
  if (!UUID.test(result?.job_id || '')) return {};
  return {
    job_id: result.job_id,
    source_type: typeof result.source_type === 'string' ? result.source_type : undefined,
    outputs: (Array.isArray(result.outputs) ? result.outputs : []).slice(0, 25)
      .filter(output => typeof output?.name === 'string')
      .map(output => ({ name: output.name, kind: typeof output.kind === 'string' ? output.kind : undefined, bytes: Number.isFinite(output.bytes) ? output.bytes : null })),
  };
}
