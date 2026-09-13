import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');
const code = skill.match(/```javascript\n([\s\S]*?)\n```/)[1];
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const run = new AsyncFunction('process', 'fetch', 'console', code);

test('setup verifies authentication before discovery and inspects the returned ID without running a task', async () => {
  const calls = [];
  const output = [];
  await run({ env: { BEATAPI_API_KEY: 'fixture-only' } }, async (url, options) => {
    calls.push({ url, options });
    const data = url.endsWith('/usage') ? {}
      : url.endsWith('/search') ? { data: [{ reference: 'model:fixture-from-search' }] }
      : { reference: 'model:fixture-from-search' };
    return { ok: true, json: async () => ({ data }) };
  }, { log: value => output.push(value) });
  assert.deepEqual(calls.map(c => new URL(c.url).pathname), [
    '/v1/usage', '/v1/capabilities/search', '/v1/capabilities/inspect',
  ]);
  assert.equal(JSON.parse(calls[2].options.body).reference, 'model:fixture-from-search');
  assert.ok(calls.every(c => c.options.redirect === 'error'));
  assert.equal(output[0].authentication, 'verified');
  assert.ok(!JSON.stringify(output).includes('fixture-only'));
});

test('invalid key and empty discovery fail closed', async () => {
  let count = 0;
  await assert.rejects(run({ env: { BEATAPI_API_KEY: 'fixture-only' } }, async () => {
    count++; return { ok: false, status: 401 };
  }, console), /401/);
  assert.equal(count, 1);
  count = 0;
  await assert.rejects(run({ env: { BEATAPI_API_KEY: 'fixture-only' } }, async () => {
    count++; return { ok: true, json: async () => ({ data: { data: [] } }) };
  }, console), /No model match/);
  assert.equal(count, 2);
});
