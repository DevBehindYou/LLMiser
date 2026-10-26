const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.MDIFY_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '../..');
const JSZip = require(path.join(root, 'frontend/node_modules/jszip'));
const origin = process.env.MDIFY_TEST_URL || 'http://127.0.0.1:3000';
const outputDir = process.env.MDIFY_BROWSER_OUTPUT || path.join(require('node:os').tmpdir(), 'mdify-reader-' + Date.now());
const content = '# Reader acceptance 漢字 🙂\n\n~~removed~~\n\n| A | B |\n| - | - |\n| 漢字 | 🙂 |\n\n[example](https://example.test)\n\n```python\nprint("漢字 🙂")\n```\n';
const other = { id: 'other-fixture', filename: 'other.md', original_name: 'other.pdf', content: '# Other document stays complete', timestamp: Date.now() };
const session = { id: 'browser-fixture', filename: 'reader.md', original_name: 'reader.pdf', content, timestamp: Date.now() };
const visible = (page, selector) => page.locator(selector).filter({ visible: true }).first();
async function download(page, action) {
  const pending = page.waitForEvent('download', { timeout: 10000 });
  await action();
  const file = await pending;
  assert.equal(await file.failure(), null);
  return { name: file.suggestedFilename(), bytes: await fs.readFile(await file.path()) };
}
async function load(page) {
  await page.goto(origin, { waitUntil: 'networkidle', timeout: 120000 });
  const accept = page.getByRole('button', { name: 'Accept & continue', exact: true });
  if (await accept.isVisible()) await accept.click();
  const recent = page.locator('button[title="Toggle Recent Conversion Sessions Sidebar"],button[aria-label="Recent conversions"]').filter({ visible: true }).first();
  await recent.click();
  const sidebar = page.getByRole('dialog', { name: 'Recent Conversions Sidebar' });
  await sidebar.getByText('other.pdf', { exact: true }).first().click();
  await sidebar.getByText('reader.pdf', { exact: true }).first().click();
  await sidebar.getByRole('button', { name: 'Close', exact: true }).click();
  await visible(page, 'textarea').waitFor();
  assert.equal(await visible(page, 'textarea').inputValue(), content);
}
(async () => {
  await fs.mkdir(outputDir, { recursive: true });
  const options = { headless: true };
  if (process.env.MDIFY_CHROMIUM_PATH) options.executablePath = process.env.MDIFY_CHROMIUM_PATH;
  const chunkDir = path.join(root, 'frontend/.next/static/chunks');
  const chunks = await fs.readdir(chunkDir);
  const findChunk = async marker => {
    for (const file of chunks.filter(f => f.endsWith('.js'))) {
      if ((await fs.readFile(path.join(chunkDir, file), 'utf8')).includes(marker)) return file;
    }
    throw new Error('Build chunk not found: ' + marker);
  };
  const readerChunk = await findChunk('Copy code snippet');
  const highlighterChunk = await findChunk('Prism');
  const browser = await chromium.launch(options);
  const report = { checkedAtUtc: new Date().toISOString(), origin, fixture: 'synthetic persisted result; no conversion/provider access', cases: [] };
  try {
    for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
      const context = await browser.newContext({ viewport, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
      await context.addInitScript(s => localStorage.setItem('llmiser_recent_sessions_v1', JSON.stringify(s)), [session, other]);
      await context.route('**/api/**', route => route.fulfill({ json: { ok: true, all_ready: true, pools: {} } }));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await load(page);
      const mode = label => page.getByRole('group', { name: 'Preview mode' }).filter({ visible: true }).first().getByRole('button', { name: label, exact: true });
      await mode('Rendered').click();
      await page.getByRole('heading', { name: 'Reader acceptance 漢字 🙂', exact: true }).filter({ visible: true }).first().waitFor();
      assert.equal(await page.locator('table').filter({ visible: true }).first().innerText(), 'A\tB\n漢字\t🙂');
      await page.locator('button[title="Copy code snippet"]').filter({ visible: true }).first().click();
      assert.equal((await page.evaluate(() => navigator.clipboard.readText())).trimEnd(), 'print("漢字 🙂")');
      await mode('Raw').click();
      const saved = await download(page, () => visible(page, 'button[title="Download .md file"]').click());
      assert.equal(saved.bytes.toString('utf8'), content);
      const zipped = await download(page, () => visible(page, 'button[title="Download all as zip"]').click());
      const zip = await JSZip.loadAsync(zipped.bytes);
      assert.equal(await zip.file('reader.md').async('string'), content);
      assert.equal(await zip.file('other.md').async('string'), other.content);
      const edited = content + '\nImmediate edit ✓ ' + name;
      const immediatePending = page.waitForEvent('download', { timeout: 10000 });
      const before = await page.evaluate(text => {
        const input = [...document.querySelectorAll('textarea')].find(e => e.getBoundingClientRect().width > 0);
        const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        const start = performance.now();
        set.call(input, text);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const button = [...document.querySelectorAll('button[title="Download .md file"]')].find(e => e.getBoundingClientRect().width > 0);
        button.click();
        return performance.now() - start;
      }, edited);
      const immediate = await immediatePending;
      let immediateBytes = null;
      if (immediate) { assert.equal(await immediate.failure(), null); immediateBytes = (await fs.readFile(await immediate.path())).toString('utf8'); }
      assert.equal(immediateBytes, edited, 'same-event .md export contains current edit');
      const mutateAndAct = (text, action) => page.evaluate(({ text, action }) => {
        const input = [...document.querySelectorAll('textarea')].find(e => e.getBoundingClientRect().width > 0);
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, text);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (action === 'keyboard') {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, shiftKey: true, bubbles: true }));
        } else {
          [...document.querySelectorAll('button[title="' + action + '"]')].find(e => e.getBoundingClientRect().width > 0).click();
        }
      }, { text, action });
      const zipText = edited + '\nZIP now';
      const currentZip = await download(page, () => mutateAndAct(zipText, 'Download all as zip'));
      const all = await JSZip.loadAsync(currentZip.bytes);
      assert.equal(await all.file('reader.md').async('string'), zipText);
      assert.equal(await all.file('other.md').async('string'), other.content);
      const copyText = edited + '\nClipboard now';
      await mutateAndAct(copyText, 'Copy to clipboard');
      await page.waitForFunction(async text => await navigator.clipboard.readText() === text, copyText);
      const keyText = edited + '\nKeyboard now';
      await mutateAndAct(keyText, 'keyboard');
      await page.waitForFunction(async text => await navigator.clipboard.readText() === text, keyText);
      const cleared = await download(page, () => mutateAndAct('', 'Download .md file'));
      assert.equal(cleared.bytes.length, 0);
      await visible(page, 'textarea').waitFor();
      const finalText = edited + '\nAfter clear';
      const final = await download(page, () => mutateAndAct(finalText, 'Download .md file'));
      assert.equal(final.bytes.toString('utf8'), finalText);
      // An export drained the old timer: it must not later restore a prior edit.
      await page.waitForTimeout(300);
      const afterTimer = await download(page, () => visible(page, 'button[title="Download .md file"]').click());
      assert.equal(afterTimer.bytes.toString('utf8'), finalText);
      const switchedText = finalText + '\nSaved when switching documents';
      await page.evaluate(text => {
        const input = [...document.querySelectorAll('textarea')].find(e => e.getBoundingClientRect().width > 0);
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, text);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        [...document.querySelectorAll('[title="other.pdf"],button[title="other.md"]')].find(e => e.getBoundingClientRect().width > 0).click();
      }, switchedText);
      await page.waitForFunction(expected => [...document.querySelectorAll('textarea')].some(e => e.getBoundingClientRect().width > 0 && e.value === expected), other.content);
      const switchedZip = await download(page, () => visible(page, 'button[title="Download all as zip"]').click());
      const switched = await JSZip.loadAsync(switchedZip.bytes);
      assert.equal(await switched.file('reader.md').async('string'), switchedText);
      assert.equal(await switched.file('other.md').async('string'), other.content);
      await page.locator('[title="reader.pdf"],button[title="reader.md"]').filter({ visible: true }).first().click();
      await page.waitForFunction(expected => [...document.querySelectorAll('textarea')].some(e => e.getBoundingClientRect().width > 0 && e.value === expected), switchedText);
      assert.deepEqual(errors, []);
      await page.screenshot({ path: outputDir + '/' + name + '.png', fullPage: false });
      report.cases.push({ name, rawDownload: 'PASS', zipDownload: 'PASS', rendering: 'PASS', codeCopy: 'PASS', editExportElapsedMs: before, immediateExport: 'CURRENT', immediateZip: 'PASS', immediateCopy: 'PASS', keyboardCopy: 'PASS', emptyExport: 'PASS', cancelledTimer: 'PASS', documentSwitch: 'PASS', pageErrors: errors });
      await context.close();
    }
    for (const [failure, chunk] of [['reader', readerChunk], ['highlighter', highlighterChunk]]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
      await context.addInitScript(s => localStorage.setItem('llmiser_recent_sessions_v1', JSON.stringify(s)), [session, other]);
      await context.route('**/api/**', route => route.fulfill({ json: { ok: true, all_ready: true, pools: {} } }));
      let blocked = 0;
      await context.route('**/' + chunk, route => { blocked++; return route.abort('failed'); });
      const page = await context.newPage();
      await load(page);
      if (failure === 'reader') {
        await page.getByText('Formatted preview is unavailable.', { exact: false }).filter({ visible: true }).first().waitFor();
        const preview = page.locator('pre').filter({ visible: true }).first();
        assert.equal(await preview.innerText(), content);
      } else {
        await page.getByRole('heading', { name: 'Reader acceptance 漢字 🙂', exact: true }).filter({ visible: true }).first().waitFor();
        assert.equal((await page.locator('pre code').filter({ visible: true }).first().innerText()).trimEnd(), 'print("漢字 🙂")');
        await visible(page, 'button[title="Copy code snippet"]').click();
        assert.equal((await page.evaluate(() => navigator.clipboard.readText())).trimEnd(), 'print("漢字 🙂")');
      }
      assert.ok(blocked > 0, failure + ' chunk was not requested');
      await page.getByRole('group', { name: 'Preview mode' }).filter({ visible: true }).first().getByRole('button', { name: 'Raw', exact: true }).click();
      const saved = await download(page, () => visible(page, 'button[title="Download .md file"]').click());
      assert.equal(saved.bytes.toString('utf8'), content);
      report.cases.push({ name: failure + '-chunk-failure', blocked, fallback: 'PASS', rawDownload: 'PASS' });
      await context.close();
    }
  } finally { await browser.close(); await fs.writeFile(outputDir + '/report.json', JSON.stringify(report, null, 2)); }
  console.log(JSON.stringify(report, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
