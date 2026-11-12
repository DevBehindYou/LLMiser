import { createSupabase, supabaseConfig } from '../../../../lib/server/supabaseRest';
import { admitPublicRequest, admissionResponse, readBoundedBody } from '../../../../lib/server/publicAdmission';
import { quotaPolicy, reserveBatch, quotaResponse } from '../../../../lib/server/quotaService';

export const dynamic = 'force-dynamic';
export async function POST(request) {
  try {
    await admitPublicRequest(request, 'upload');
    const config = supabaseConfig();
    if (!config) return Response.json({ detail: 'Uploads are unavailable.' }, { status: 503 });
    const db = createSupabase(config);
    if (!(await quotaPolicy(db)).enabled) return Response.json({ enabled: false }, { headers: { 'Cache-Control': 'no-store' } });
    const body = await readBoundedBody(request, 64 * 1024);
    if (body.error) return body.error;
    let input;
    try { input = JSON.parse(new TextDecoder().decode(body.bytes)); }
    catch { return Response.json({ detail: 'Expected a JSON manifest.' }, { status: 400 }); }
    return Response.json(await reserveBatch(db, request, input), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return quotaResponse(error) || admissionResponse(error) || Response.json({ detail: 'Could not reserve this batch. Retry the same selection.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
