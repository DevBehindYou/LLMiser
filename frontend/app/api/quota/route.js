import { createSupabase, supabaseConfig } from '../../../lib/server/supabaseRest';
import { admitPublicRequest, admissionResponse } from '../../../lib/server/publicAdmission';
import { assertQuotaOrigin, guestCookie, guestSubject, issueGuest, quotaPolicy, quotaResponse } from '../../../lib/server/quotaService';

export const dynamic = 'force-dynamic';
export async function GET(request) {
  const headers = { 'Cache-Control': 'no-store', Vary: 'Cookie' };
  try {
    const config = supabaseConfig();
    if (!config) {
      if (process.env.NODE_ENV === 'development' && process.env.VERCEL !== '1') return Response.json({ enabled: false }, { headers });
      return Response.json({ detail: 'File limits are unavailable.' }, { status: 503, headers });
    }
    const db = createSupabase(config);
    const policy = await quotaPolicy(db);
    if (!policy.enabled) return Response.json(policy, { headers });
    assertQuotaOrigin(request);
    let subject = guestSubject(request);
    if (!subject) {
      await admitPublicRequest(request, 'upload');
      const token = issueGuest();
      headers['Set-Cookie'] = guestCookie(token);
      subject = guestSubject(new Request(request.url, { headers: { Cookie: `__Host-llmiser_guest=${token}` } }));
    }
    return Response.json(await db.rpc('quota_snapshot', { p_subject_hash: subject }), { headers });
  } catch (error) {
    return quotaResponse(error) || admissionResponse(error) || Response.json({ detail: 'File limits are temporarily unavailable.' }, { status: 503, headers });
  }
}
