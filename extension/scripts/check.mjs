import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT } from './build.mjs';

const output=path.join(ROOT,'dist');
const manifest=JSON.parse(await fs.readFile(path.join(output,'manifest.json'),'utf8'));
assert.equal(manifest.manifest_version,3);
assert.deepEqual(manifest.permissions,['activeTab','scripting','storage']);
assert.equal(manifest.action.default_popup,'popup.html');
for (const key of ['side_panel','background','host_permissions','content_scripts','externally_connectable','web_accessible_resources','update_url']) assert.equal(manifest[key],undefined,key);
assert.deepEqual(manifest.optional_host_permissions,['https://llmiser.devbehindyou.com/*','https://ppmbqgecdbrezxedyeur.supabase.co/*']);
assert.equal(manifest.content_security_policy.extension_pages,"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src https://llmiser.devbehindyou.com https://ppmbqgecdbrezxedyeur.supabase.co; object-src 'none'; base-uri 'none'; frame-src 'none'");
assert.doesNotMatch(manifest.content_security_policy.extension_pages,/unsafe-eval|unsafe-inline|\*|http:/);
for (const file of ['popup.js','popup.html','popup.css','PRIVACY.md','LICENSE','THIRD_PARTY_NOTICES.txt',...Object.values(manifest.icons)]) assert.ok((await fs.stat(path.join(output,file))).size>0,file);
for (const [size, filename] of Object.entries(manifest.icons)) {
  const png=await fs.readFile(path.join(output,filename));
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),Number(size));assert.equal(png.readUInt32BE(20),Number(size));
}
for (const filename of ['popup.js']) {
  const code=await fs.readFile(path.join(output,filename),'utf8');
  assert.doesNotMatch(code,/localhost|127\.0\.0\.1|DEVELOPMENT PREVIEW|fixture\.html|__LLMISER_CAPTURE|Readability|Turndown/,filename);
}
assert.doesNotMatch(await fs.readFile(path.join(output,'popup.html'),'utf8'),/<script[^>]*>\s*[^<\s]/);
const html=await fs.readFile(path.join(output,'popup.html'),'utf8');
assert.equal((html.match(/<main>/g)||[]).length,1);
assert.doesNotMatch(html,/<nav\b|href=".*(?:blog|usecase|controller)/);
assert.doesNotMatch(html,/capture-page|capture-selection|include-images|include-source|Page scope/);
assert.match(await fs.readFile(path.join(output,'popup.css'),'utf8'),/html\{width:400px;height:600px/);
assert.deepEqual((await fs.readdir(output)).sort(),['LICENSE','PRIVACY.md','THIRD_PARTY_NOTICES.txt','icons','manifest.json','popup.css','popup.html','popup.js'].sort());
console.log('Toolbar popup, reduced permissions, restricted CSP, icon dimensions, removed page capture and package allowlist passed.');
