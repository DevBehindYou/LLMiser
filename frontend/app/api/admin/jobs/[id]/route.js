import { jobDetail, jobDetailPage } from '../../../../../lib/server/adminService';
import { adminJson, withAdmin } from '../../../../../lib/server/adminRoute';

export const dynamic = 'force-dynamic';

export const GET = withAdmin(async ({ request, params, db }) => {
  // Old cached clients must reload rather than silently export only page one.
  if (request.headers.get('x-llmiser-detail-paging') !== '1') {
    return adminJson({ detail: 'Reload the controller to use paginated job details.' }, { status: 409 });
  }
  const query = new URL(request.url).searchParams;
  const section = query.get('section');
  return adminJson(section
    ? await jobDetailPage(db, params.id, section, { limit: query.get('limit') ?? undefined, cursor: query.get('cursor'), stored: query.get('stored'), kind: query.get('kind') })
    : await jobDetail(db, params.id));
}, { name: 'job' });
