import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NextRequest } from 'next/server.js';
import { issueSession } from '../lib/server/adminAuth.js';

const asModule=source=>`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const routeUrl=new URL('../app/api/admin/jobs/[id]/route.js',import.meta.url);
const guardUrl=new URL('../lib/server/adminRoute.js',import.meta.url);
const guard=asModule(fs.readFileSync(guardUrl,'utf8').replace(/from '([^']+)'/g,(_s,name)=>`from '${name==='next/server'?new URL('../node_modules/next/server.js',import.meta.url).href:new URL(name,guardUrl).href}'`));
const {GET}=await import(asModule(fs.readFileSync(routeUrl,'utf8').replace(/from '([^']+)'/g,(_s,name)=>`from '${name.endsWith('/adminRoute')?guard:new URL(name+'.js',routeUrl).href}'`)));

test('detail route authenticates before paging negotiation, bounds reads and keeps private headers',async()=>{
  const keys=['ADMIN_KEY_1','ADMIN_KEY_2','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];
  const before=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  const oldFetch=globalThis.fetch;
  Object.assign(process.env,{ADMIN_KEY_1:'test-first-key-0123456789abcdef',ADMIN_KEY_2:'test-second-key-0123456789abcdef',SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'test-key'});
  try {
    const id='00000000-0000-4000-8000-000000000001';
    const token=issueSession([process.env.ADMIN_KEY_1,process.env.ADMIN_KEY_2]).token;
    let queries=0;
    globalThis.fetch=async url=>{
      queries++;
      const parsed=new URL(url);
      if(parsed.pathname.endsWith('/jobs')) return Response.json([{job_id:id}]);
      assert.equal(parsed.searchParams.get('job_id'),`eq.${id}`);
      assert.equal(parsed.searchParams.get('limit'),'1');
      return Response.json([{event_id:'first',created_at:'2026-10-29T00:00:00.000001+00:00'}],{headers:{'Content-Range':'0-0/2'}});
    };
    const request=(query='',headers={})=>new NextRequest(`https://app.test/api/admin/jobs/${id}${query}`,{headers});
    const context={params:{id}};
    const unauth=await GET(request(),context);
    assert.equal(unauth.status,401);
    const stale=await GET(request('',{cookie:`mdify_admin=${token}`}),context);
    assert.equal(stale.status,409);
    assert.equal(queries,0,'old clients and unauthenticated reads must not query job content');
    const headers={cookie:`mdify_admin=${token}`,'x-llmiser-detail-paging':'1'};
    const valid=await GET(request('?section=events&limit=1',headers),context);
    assert.equal(valid.status,200);
    const page=await valid.json();
    assert.equal(page.rows.length,1);assert.equal(page.total,2);assert.ok(page.next);
    const invalid=await GET(request('?section=events&limit=0',headers),context);
    assert.equal(invalid.status,400);
    for(const response of [unauth,stale,valid,invalid]) {
      assert.equal(response.headers.get('cache-control'),'no-store');
      assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
    }
  } finally {
    globalThis.fetch=oldFetch;
    keys.forEach(key=>{if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key];});
  }
});
