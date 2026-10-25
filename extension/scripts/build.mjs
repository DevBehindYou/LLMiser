import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function buildExtension({ preview = false } = {}) {
  const output = path.resolve(ROOT, preview ? '.preview' : 'dist');
  if (path.dirname(output) !== ROOT) throw new Error('Build output must stay inside extension/');
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(path.join(output, 'icons'), { recursive: true });
  const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'manifest.json'), 'utf8'));
  await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2)+'\n');
  for (const file of ['popup.html','popup.css']) await fs.copyFile(path.join(ROOT,file),path.join(output,file));
  const iconFiles = { 16:'favicon-16-light.png',32:'favicon-32-light.png',48:'icon-48-light.png',128:'icon-128-light.png' };
  for (const [size,file] of Object.entries(iconFiles)) await fs.copyFile(path.join(ROOT,'..','frontend','public',file),path.join(output,'icons',`${size}.png`));
  const plugins = preview ? [{ name:'preview-adapter',setup(builder) {
    builder.onResolve({filter:/^\.\/bridge\.js$/}, () => ({ path:path.join(ROOT,'dev','adapter.js') }));
  } }] : [];
  await build({ entryPoints:{ popup:path.join(ROOT,'src/popup.js') },
    outdir:output,bundle:true,format:'iife',platform:'browser',target:'chrome116',minify:true,legalComments:'external',plugins });
  await fs.writeFile(path.join(output,'THIRD_PARTY_NOTICES.txt'),'The file-only converter bundles LLMiser source under the repository GPLv3 license. No third-party runtime libraries are bundled. Build/test tools are not shipped in this package.\n');
  await fs.copyFile(path.join(ROOT,'PRIVACY.md'),path.join(output,'PRIVACY.md'));
  await fs.copyFile(path.join(ROOT,'..','LICENSE'),path.join(output,'LICENSE'));
  if (preview) {
    await fs.copyFile(path.join(ROOT,'dev','index.html'),path.join(output,'index.html'));
  }
  return output;
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) console.log(`Built ${await buildExtension()}`);
