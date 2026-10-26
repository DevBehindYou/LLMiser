import fs from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import { ROOT } from './build.mjs';

const version=JSON.parse(await fs.readFile(path.join(ROOT,'manifest.json'),'utf8')).version;
const zip=new JSZip();
async function add(directory,prefix='') {
  for(const entry of await fs.readdir(directory,{withFileTypes:true})) {
    const name=prefix+entry.name;
    if(entry.isDirectory()) await add(path.join(directory,entry.name),name+'/');
    else zip.file(name,await fs.readFile(path.join(directory,entry.name)));
  }
}
await add(path.join(ROOT,'dist'));
await fs.mkdir(path.join(ROOT,'artifacts'),{recursive:true});
const target=path.join(ROOT,'artifacts',`llmiser-chrome-${version}.zip`);
await fs.writeFile(target,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
console.log(target);
