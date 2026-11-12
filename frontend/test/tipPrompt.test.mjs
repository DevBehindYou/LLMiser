import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTipPrompt, TIP_PROMPT } from '../lib/models/tipPrompt.js';

function memory() {
  const data = new Map();
  return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
}

test('third success is eligible, with one showing per local day and per tab session', () => {
  let time = new Date(2026, 10, 13, 23, 59, 59, 999).getTime();
  const storage = memory();
  const open = () => createTipPrompt({ storage, session: memory(), now: () => time });
  const prompt = open();
  assert.equal(prompt.canShow(), false);
  prompt.recordSuccess();
  assert.equal(prompt.canShow(), false);
  prompt.recordSuccess();
  assert.equal(prompt.canShow(), false);
  prompt.recordSuccess();
  assert.equal(prompt.markShown(), true);
  prompt.snooze('dismiss');
  assert.equal(open().canShow(), false);
  time += 1;
  assert.equal(prompt.canShow(), false);
  assert.equal(open().canShow(), true);
});

for (const [action, days] of [['support', 90], ['already-supported', 7]]) {
  test(`${action} snoozes for ${days} local days`, () => {
    let time = new Date(2026, 10, 13, 12).getTime();
    const storage = memory();
    const open = () => createTipPrompt({ storage, session: memory(), now: () => time });
    const prompt = open();
    for (let i = 0; i < 3; i++) prompt.recordSuccess();
    assert.equal(prompt.markShown(), true);
    prompt.snooze(action);
    const end = new Date(time);
    end.setDate(end.getDate() + days);
    time = end.getTime() - 1;
    assert.equal(open().canShow(), false);
    time++;
    assert.equal(open().canShow(), true);
  });
}

test('the kill switch and blocked storage prevent the card', () => {
  const blocked = { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } };
  const prompt = createTipPrompt({ storage: blocked, session: memory() });
  assert.equal(prompt.recordSuccess(), false);
  assert.equal(prompt.markShown(), false);
  const disabled = createTipPrompt({ storage: memory(), session: memory(), config: { ...TIP_PROMPT, enabled: false } });
  assert.equal(disabled.recordSuccess(), false);
  assert.equal(disabled.canShow(), false);
});
