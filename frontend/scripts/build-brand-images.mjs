// Reproducible social card using the approved Prompt L asset.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#08080a"/>
  <rect width="1200" height="6" fill="#a0a0ff"/>
  <rect x="820" y="100" width="300" height="300" rx="40" fill="#111114" stroke="#2a2a32" stroke-width="2"/>
  <text x="72" y="135" font-family="Segoe UI,Arial,sans-serif" font-size="58" font-weight="700" fill="#f2f2f6">LLMiser</text>
  <text x="72" y="195" font-family="Consolas,monospace" font-size="19" letter-spacing="2" fill="#f59e0b">FREE · NO SIGN-UP · OPEN SOURCE</text>
  <text x="72" y="290" font-family="Segoe UI,Arial,sans-serif" font-size="60" font-weight="700" fill="#f2f2f6">LLM cost optimizer</text>
  <text x="72" y="365" font-family="Segoe UI,Arial,sans-serif" font-size="39" fill="#a0a0ff">Make Every Token Count.</text>
  <text x="72" y="435" font-family="Segoe UI,Arial,sans-serif" font-size="24" fill="#c2c2cc">Documents → Markdown → Useful AI context</text>
  <rect x="72" y="520" width="1056" height="1" fill="#2a2a32"/>
  <text x="72" y="573" font-family="Consolas,monospace" font-size="23" fill="#c2c2cc">llmiser.devbehindyou.com</text>
  <text x="1128" y="573" text-anchor="end" font-family="Segoe UI,Arial,sans-serif" font-size="21" fill="#9494a0">by DevBehindYou</text>
</svg>`;
const icon = await sharp(path.join(PUBLIC, 'llmiser-icon-dark.svg')).resize(250, 250).png().toBuffer();
await sharp(Buffer.from(svg)).composite([{ input: icon, left: 845, top: 125 }]).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC, 'og-card.png'));
console.log('Built 1200 × 630 LLMiser social card with Prompt L.');
