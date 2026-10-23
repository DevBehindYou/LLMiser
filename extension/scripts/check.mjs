import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT } from './build.mjs';

const output=path.join(ROOT,'dist');
const manifest=JSON.parse(await fs.readFile(path.join(output,'manifest.json'),'utf8'));
assert.equal(manifest.manifest_version,3);
assert.deepEqual(manifest.permissions,['activeTab','scripting','sidePanel','storage']);
for (const key of ['host_permissions','content_scripts','externally_connectable','web_accessible_resources','update_url']) assert.equal(manifest[key],undefined,key);
assert.deepEqual(manifest.optional_host_permissions,['https://llmiser.devbehindyou.com/*','https://ppmbqgecdbrezxedyeur.supabase.co/*']);
assert.equal(manifest.content_security_policy.extension_pages,"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src https://llmiser.devbehindyou.com https://ppmbqgecdbrezxedyeur.supabase.co; object-src 'none'; base-uri 'none'; frame-src 'none'");
assert.doesNotMatch(manifest.content_security_policy.extension_pages,/unsafe-eval|unsafe-inline|\*|http:/);
for (const file of ['panel.js','capture.js','worker.js','sidepanel.html','sidepanel.css','PRIVACY.md','LICENSE','THIRD_PARTY_NOTICES.txt',...Object.values(manifest.icons)]) assert.ok((await fs.stat(path.join(output,file))).size>0,file);
for (const [size, filename] of Object.entries(manifest.icons)) {
  const png=await fs.readFile(path.join(output,filename));
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),Number(size));assert.equal(png.readUInt32BE(20),Number(size));
}
for (const filename of ['panel.js','capture.js','worker.js']) {
  const code=await fs.readFile(path.join(output,filename),'utf8');
  assert.doesNotMatch(code,/localhost|127\.0\.0\.1|DEVELOPMENT PREVIEW|fixture\.html/,filename);
}
assert.doesNotMatch(await fs.readFile(path.join(output,'sidepanel.html'),'utf8'),/<script[^>]*>\s*[^<\s]/);
const html=await fs.readFile(path.join(output,'sidepanel.html'),'utf8');
assert.equal((html.match(/<main>/g)||[]).length,1);
assert.doesNotMatch(html,/<nav\b|href=".*(?:blog|usecase|controller)/);
console.log('MV3 package, optional upload permissions, restricted CSP, icon dimensions, single screen and preview isolation passed.');
