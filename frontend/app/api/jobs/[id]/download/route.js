import { NextResponse } from 'next/server';
import { createSupabase, supabaseConfig } from '../../../../../lib/server/supabaseRest';
import { JobError, downloadResult } from '../../../../../lib/server/jobService';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Fresh short-lived signed URL for a completed job's Markdown.
export async function GET(request, { params }) {
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ detail: 'Direct upload is not configured' }, { status: 501 });
  if (!UUID.test(params.id)) return NextResponse.json({ detail: 'Unknown job' }, { status: 404 });

  try {
    const outputName = new URL(request.url).searchParams.get('output');
    const body = await downloadResult(createSupabase(config), params.id, { outputName });
    if (outputName !== null) {
      const output = body.result.outputs.find(item => item.name === outputName);
      if (!output) throw new JobError('Output not found', 404);
      return NextResponse.redirect(output.url, { status: 307, headers: { 'Cache-Control': 'no-store' } });
    }
    // Preserve the existing primary-link contract; add all freshly signed outputs.
    return NextResponse.json({ ...body, download_url: body.result.download_url }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    if (err instanceof JobError) return NextResponse.json({ detail: err.message }, { status: err.status, headers: { 'Cache-Control': 'no-store' } });
    console.error('[jobs/download]', err.message);
    return NextResponse.json({ detail: 'Could not create a download link' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
