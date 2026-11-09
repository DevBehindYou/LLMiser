// Visual spec for M01-S2 "Which Dependency Files Should You Keep for AI Review?".
// Data: fixtures/inputs.json and out-*/PROJECT_INDEX.md.

import { B, art, banner, decision, figure, note } from '../../visuals/kit.mjs';
import { checklist, columns, compare } from '../../visuals/campaign-parts.mjs';

const bannerArt = () => {
  let out = art.box(650, 60, 230, 270, { fill: '#ffffff', r: 12 });
  out += art.label(668, 96, 'sharing copy', { size: 18, fill: B.amberD });
  ['package.json', 'package-lock.json', 'patches/round.js', 'src/invoice.js'].forEach((t, i) => {
    out += `<rect x="666" y="${116 + i * 50}" width="198" height="38" rx="7" fill="#fde7c2" stroke="${B.amberD}" stroke-width="1.5"/>`;
    out += art.label(678, 141 + i * 50, t, { size: 15 });
  });
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 5; c += 1) out += `<rect x="${930 + c * 44}" y="${98 + r * 44}" width="36" height="36" rx="4" fill="${B.mist}" stroke="${B.ink}" stroke-width="1.2" opacity="0.8"/>`;
  }
  out += art.label(1036, 300, 'node_modules', { size: 18, anchor: 'middle' });
  out += `<path d="M942 316L1130 316" stroke="${B.pink}" stroke-width="3" stroke-dasharray="7 6"/>`;
  return out;
};

export default {
  banner: banner({
    id: 'deps-banner',
    kicker: 'DEPENDENCIES',
    hook: ['Keep the map,', 'not the warehouse.'],
    sub: 'manifests, lockfiles, patched copies',
    art: bannerArt,
  }),
  figures: {
    'keep-or-leave': figure({
      title: 'Describe dependencies, skip the install',
      subtitle: 'From the synthetic shop project.',
      parts: [
        columns({
          left: {
            title: 'Keep',
            s: 's1',
            lines: ['+ package.json', 'version range', '+ package-lock.json', 'exact version', '+ patched copy', 'code you import', '+ README line', 'where it came from'],
          },
          right: {
            title: 'Leave out',
            s: 's3',
            lines: ['- node_modules/', 'installed copies', '- .venv/', 'Python packages', '- package caches', '', '- build output', ''],
          },
        }),
      ],
    }),
    'bundle-variants': figure({
      title: 'Four bundles, one question',
      subtitle: 'Why does total(2.675) return 2.67?',
      parts: [
        compare({
          headers: ['BUNDLE', 'VERSION KNOWN', 'ROUNDING CODE'],
          widths: [200, 170, 182],
          size: 12.5,
          rows: [
            { label: 'Source + test', cells: [{ t: 'no', ok: false }, { t: 'no', ok: false }] },
            { label: '+ package.json', cells: [{ t: 'range ^2.1.0', ok: null }, { t: 'no', ok: false }] },
            { label: '+ lockfile', cells: [{ t: 'exact 2.1.4', ok: true }, { t: 'no', ok: false }] },
            { label: '+ patches/ copy', cells: [{ t: 'exact 2.1.4', ok: true }, { t: 'yes', ok: true }] },
          ],
        }),
        note('In the working folder the patch sat in vendor/, skipped by name.'),
      ],
    }),
    'vendor-decision': figure({
      title: 'Your copy or theirs?',
      subtitle: 'A patched dependency is part of your code.',
      parts: [
        decision({
          start: { t: 'A dependency' },
          question: 'Import or patch a copy?',
          yes: { t: 'Keep that copy', sub: 'in patches/, not vendor/', s: 's1' },
          no: { t: 'Manifest + lockfile', sub: 'are enough' },
          after: { t: 'Check the index', sub: 'is it in the results?' },
        }),
      ],
    }),
    'dependency-checklist': figure({
      title: 'Before you zip',
      subtitle: 'Dependency files in a sharing copy.',
      parts: [
        checklist([
          { t: 'Manifest kept (package.json, pyproject.toml)' },
          { t: 'Lockfile kept' },
          { t: 'Installed package folders removed' },
          { t: 'Imported or patched copies kept outside skipped folders' },
          { t: 'README says where a patch came from' },
        ]),
        note('LLMiser skips vendor, node_modules, .venv and similar folders by name.', { s: 's3' }),
      ],
    }),
  },
};
