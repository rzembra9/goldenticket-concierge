import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { createApp } from '../server.mjs';

const valid = { name: 'Élodie Test', contact: 'test@example.com', event: 'Concert test @everyone', city: 'Paris', date: '2099-10-15', quantity: 2, category: 'Tribune', budget: 150.50, comment: 'Deux places côte à côte', consent: true, website: '' };
const env = { DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/123456789/mock_token_not_a_real_secret', PUBLIC_ORIGIN: 'https://goldenticket.example', NODE_ENV: 'production' };
async function setup(t, overrides = {}) {
  const calls = [];
  const server = createApp({ env, fetchImpl: async (url, options) => { calls.push({ url: String(url), ...options }); return Response.json({ id: 'mock-message' }); }, ...overrides });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (data = valid, headers = {}, key = randomUUID()) => fetch(`${base}/api/request`, { method: 'POST', headers: { Origin: env.PUBLIC_ORIGIN, 'Content-Type': 'application/json', 'Idempotency-Key': key, ...headers }, body: typeof data === 'string' ? data : JSON.stringify(data) });
  return { base, calls, post };
}
test('valid request reaches Discord with all nine fields and no mentions; repeat is deduplicated', async t => {
  const { calls, post } = await setup(t); const key = randomUUID();
  const response = await post(valid, {}, key); assert.equal(response.status, 200);
  const result = await response.json(); assert.equal(result.ok, true); assert.match(result.reference, /^GT-/);
  assert.equal(calls.length, 1); assert.match(calls[0].url, /wait=true/);
  const message = JSON.parse(calls[0].body); assert.deepEqual(message.allowed_mentions, { parse: [] });
  assert.equal(message.embeds[0].fields.length, 9);
  for (const value of ['Élodie Test', 'test@example.com', 'Concert test @everyone', 'Paris', '2099-10-15', '2', 'Tribune', '150.5', 'Deux places côte à côte']) assert.ok(message.embeds[0].fields.some(field => field.value === value));
  assert.equal((await post(valid, {}, key)).status, 200); assert.equal(calls.length, 1);
  assert.equal((await post({ ...valid, budget: 200 }, {}, key)).status, 409);
});
test('invalid fields, consent, dates and honeypot are rejected without Discord call', async t => {
  const { post, calls } = await setup(t);
  for (const change of [{ name: '' }, { contact: '' }, { event: '' }, { city: '' }, { category: '' }, { quantity: 0 }, { quantity: 1.5 }, { budget: -1 }, { budget: '150' }, { budget: 2.999 }, { consent: false }, { date: '2099-02-30' }, { date: '2000-01-01' }, { comment: 'x'.repeat(1001) }, { website: 'spam' }]) assert.equal((await post({ ...valid, ...change })).status, 400, JSON.stringify(change));
  assert.equal(calls.length, 0);
});
test('blocks cross origin, missing origin, malformed JSON, wrong type, oversized body and wrong method', async t => {
  const { post, base } = await setup(t);
  assert.equal((await post(valid, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await post(valid, { Origin: '' })).status, 403);
  assert.equal((await post('{')).status, 400);
  assert.equal((await post(valid, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await post({ ...valid, comment: 'x'.repeat(20000) })).status, 413);
  assert.equal((await fetch(`${base}/api/request`)).status, 405);
});
test('missing or unsafe webhook and production origin fail closed', async t => {
  for (const config of [{ ...env, DISCORD_WEBHOOK_URL: '' }, { ...env, DISCORD_WEBHOOK_URL: 'https://evil.example/api/webhooks/123/secret' }, { ...env, PUBLIC_ORIGIN: '' }]) {
    const { post, calls } = await setup(t, { env: config }); assert.equal((await post()).status, 503); assert.equal(calls.length, 0);
  }
});
test('Discord failures and missing acknowledgement never show success', async t => {
  for (const status of [429, 500]) { const { post } = await setup(t, { fetchImpl: async () => new Response('', { status }) }); assert.equal((await post()).status, 502); }
  const { post } = await setup(t, { fetchImpl: async () => new Response(null, { status: 204 }) }); assert.equal((await post()).status, 502);
});
test('timeout returns a retry message without leaking secret', async t => {
  const { post } = await setup(t, { timeoutMs: 10, fetchImpl: async (_url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason))) });
  const response = await post(); assert.equal(response.status, 504); assert.ok(!(await response.text()).includes('mock_token'));
});
test('rate limit cannot be bypassed by spoofed forwarded addresses', async t => {
  const { post } = await setup(t);
  for (let i = 0; i < 30; i++) await post({ ...valid, name: '' }, { 'X-Forwarded-For': `1.2.3.${i}` });
  const response = await post(); assert.equal(response.status, 429); assert.equal(response.headers.get('retry-after'), '600');
});
test('only public assets served; secret and source files unavailable', async t => {
  const { base } = await setup(t);
  for (const path of ['/', '/app.js', '/styles.css', '/favicon.svg']) { const response = await fetch(base + path); assert.equal(response.status, 200); assert.ok(response.headers.get('content-security-policy')); assert.ok(!(await response.text()).includes('mock_token_not_a_real_secret')); }
  for (const path of ['/.env', '/server.mjs', '/package.json', '/%2e%2e/.env']) assert.equal((await fetch(base + path)).status, 404);
});
