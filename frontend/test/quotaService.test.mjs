import { test } from 'node:test';
import assert from 'node:assert/strict';
import { issueGuest, guestSubject, guestCookie, requireGuest, quotaResponse, QuotaError, normalizedManifest } from '../lib/server/quotaService.js';
const env = { QUOTA_GUEST_SECRET: 'test-only-secret-with-at-least-thirty-two-characters', BACKEND_URLS: 'https://normal.example' };
test('opaque guest cookie is signed, host-only and never accepts an arbitrary identity', () => {
  const token = issueGuest(env);
  const request = new Request('https://llmiser.devbehindyou.com/api/quota', { headers: { Cookie: `__Host-llmiser_guest=${token}` } });
  assert.match(guestSubject(request,env),/^[a-f0-9]{64}$/);
  assert.equal(requireGuest(request,env),guestSubject(request,env));
  assert.equal(guestSubject(new Request(request.url,{headers:{Cookie:`__Host-llmiser_guest=${'0'.repeat(64)}.${'0'.repeat(64)}`}}),env),null);
  assert.match(guestCookie(token),/Secure; HttpOnly; SameSite=Lax/);
  assert.doesNotMatch(guestCookie(token),/Domain=/);
  assert.throws(()=>requireGuest(new Request(request.url,{headers:{Cookie:`__Host-llmiser_guest=${token}`,Origin:'https://attacker.example'}}),env),/Open LLMiser/);
});
test('quota exhaustion keeps real remaining and uses the batch-fit retry time', async () => {
  const res=quotaResponse(new QuotaError('DAILY_FILE_LIMIT',429,'Remove files',{remaining:1,serverTime:'2026-11-11T00:00:00Z',requestedAvailableAt:'2026-11-11T01:00:00Z'}));
  assert.equal(res.headers.get('retry-after'),'3600');
  assert.equal((await res.json()).remaining,1);
});
test('invalid file manifests fail before any database admission', () => {
  assert.throws(()=>normalizedManifest([],env),/between 1 and 20/);
  assert.throws(()=>normalizedManifest([{file_id:'forged'}],env),/unique identifier/);
});
