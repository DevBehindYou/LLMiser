import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

test('self-hosted font inventory retains bytes, subsets, weights and local preloads without a remote loader',async()=>{
  const assets=new URL('../public/fonts/',import.meta.url);
  const {fonts}=JSON.parse(fs.readFileSync(new URL('manifest.json',assets),'utf8'));
  const css=fs.readFileSync(new URL('../app/fonts.css',import.meta.url),'utf8');
  const layout=fs.readFileSync(new URL('../app/layout.js',import.meta.url),'utf8');
  assert.equal(fonts.length,16);
  assert.equal(new Set(fonts.map(font=>font.file)).size,16);
  assert.equal((css.match(/@font-face/g)||[]).length,25);
  assert.doesNotMatch(css,/https?:|_next\/static/);
  assert.doesNotMatch(layout,/next\/font\/google/);
  for(const font of fonts){
    assert.match(font.file,/^v1\/[a-z0-9-]+\.woff2$/);
    const bytes=fs.readFileSync(new URL(font.file,assets));
    assert.equal(bytes.toString('ascii',0,4),'wOF2');
    assert.equal(bytes.length,font.bytes);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),font.sha256);
    assert.ok(css.includes(`/fonts/${font.file}`));
  }
  const preload=fonts.filter(font=>font.preload);
  assert.equal(preload.length,3);
  assert.equal(preload.reduce((total,font)=>total+font.bytes,0),93996);
  for(const font of preload)assert.ok(layout.includes(`href="/fonts/${font.file}" as="font" type="font/woff2" crossOrigin="anonymous"`));
  const faces=css.match(/@font-face\{[^}]+\}/g);
  for(const family of ['Inter','JetBrains Mono','Patrick Hand']){
    const main=faces.filter(face=>face.includes(`font-family:"LLMiser ${family}"`));
    assert.ok(main.every(face=>face.includes('font-display:swap')&&face.includes('unicode-range:')));
    assert.ok(faces.some(face=>face.includes(`font-family:"LLMiser ${family} Fallback"`)&&face.includes('size-adjust:')));
  }
  assert.ok(faces.some(face=>face.includes('u+0400-045f')),'Cyrillic coverage retained');
  assert.ok(faces.some(face=>face.includes('font-weight:100 900')),'Inter variable weights retained');
  assert.ok(faces.some(face=>face.includes('font-weight:500')&&face.includes('LLMiser JetBrains Mono')));
  for(const file of ['Inter-OFL.txt','JetBrainsMono-OFL.txt','PatrickHand-OFL.txt'])assert.match(fs.readFileSync(new URL(file,assets),'utf8'),/SIL OPEN FONT LICENSE/);
  const config=createRequire(import.meta.url)('../next.config.js');
  const headers=await config.headers();
  assert.ok(headers.find(rule=>rule.source==='/fonts/v1/:path*').headers.some(header=>header.key==='Cache-Control'&&header.value==='public, max-age=31536000, immutable'));
});
