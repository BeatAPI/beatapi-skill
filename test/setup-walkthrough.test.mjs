import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const skill = read('SKILL.md');
const page = (name) => read(`references/${name}.md`);

// Every Markdown page under references/, as the path the site publishes it at
// (https://beatapi.io/skill-refs/<path>).
const pagePaths = readdirSync(fileURLToPath(new URL('../references/', import.meta.url)), { recursive: true })
  .map((path) => String(path).replaceAll('\\', '/'))
  .filter((path) => path.endsWith('.md'))
  .sort();
const everything = [['SKILL.md', skill], ...pagePaths.map((path) => [`references/${path}`, read(`references/${path}`)])];
const stepPages = ['search', 'inspect', 'run', 'errors', 'billing', 'free-models'];
const refLinks = (text) => [...text.matchAll(/https:\/\/beatapi\.io\/skill-refs\/([^>\s)]+)/g)].map((match) => match[1]);

const INDEX_MAX_LINES = 90;
const MAX_BYTES = 4_500;

// SKILL.md is the index every agent loads, including weak ones with small
// contexts. Detail lives in short stand-alone pages under references/
// (published at /skill-refs/); an agent opens only the one it needs.
test('the index stays small enough for weak agents', () => {
  assert.ok(skill.split('\n').length < INDEX_MAX_LINES, `SKILL.md has ${skill.split('\n').length} lines`);
  assert.ok(Buffer.byteLength(skill) < MAX_BYTES, `SKILL.md is ${Buffer.byteLength(skill)} bytes`);
});

test('no page is too large to load on its own', () => {
  for (const name of stepPages) {
    assert.ok(pagePaths.includes(`${name}.md`), `missing references/${name}.md`);
  }
  for (const path of pagePaths) {
    const bytes = Buffer.byteLength(read(`references/${path}`));
    assert.ok(bytes <= MAX_BYTES, `references/${path} is ${bytes} bytes`);
  }
});

test('the index names every page, and every page it names exists', () => {
  const links = refLinks(skill);
  for (const name of [...stepPages, 'web-search', 'setup', 'recipes/xiaohongshu-topic-research',
    'recipes/competitor-accounts', 'recipes/decide-with-jev']) {
    assert.ok(links.includes(`${name}.md`), `the index does not link ${name}.md`);
  }
  for (const link of links) {
    assert.ok(existsSync(new URL(`../references/${link}`, import.meta.url)), `missing references/${link}`);
  }
  // No orphans: a page the index does not name is a page no agent finds.
  for (const path of pagePaths) {
    assert.ok(links.includes(path), `references/${path} is not linked from the index`);
  }
});

test('links between pages resolve', () => {
  for (const path of pagePaths) {
    for (const link of refLinks(read(`references/${path}`))) {
      assert.ok(existsSync(new URL(`../references/${link}`, import.meta.url)), `references/${path} links missing ${link}`);
    }
  }
});

test('each step page stands alone: a title, then when to read it', () => {
  for (const name of stepPages) {
    assert.match(page(name), /^# .+\n\nRead this /, `references/${name}.md must open with its title and when to read it`);
  }
});

test('one loop for every capability, driven by the next field', () => {
  for (const tool of ['capabilities_search', 'capabilities_inspect', 'capabilities_run',
    'web_search', 'web_read', 'web_map', 'web_research']) {
    assert.ok(skill.includes(tool), `missing MCP tool ${tool}`);
  }
  for (const tool of ['web_search', 'web_read', 'web_map', 'web_research']) {
    assert.ok(page('web-search').includes(tool), `web-search.md is missing MCP tool ${tool}`);
  }
  assert.match(skill, /Every response has a `next` field/);
  assert.match(skill, /never invent one/);
  const run = page('run');
  assert.match(run, /"operation":"status","task_id"/);
  // Text and decision models run through the same Run call.
  assert.match(run, /"reference":"model:<id>","input":\{"input":"<prompt>"\}/);
  assert.match(run, /output_text/);
  assert.match(run, /model:jev-1\.13-free/);
  assert.match(run, /at most 10 criteria/);
  for (const [path, text] of everything) {
    assert.doesNotMatch(text, /\/v1\/capabilities\/run\/status/, path);
    assert.doesNotMatch(text, /direct_api|run_supported: `false`/, path);
  }
});

test('each step has its curl call on its own page', () => {
  assert.match(skill, /curl -sS -X POST https:\/\/api\.beatapi\.io\/v1\/capabilities\/search/);
  for (const step of ['search', 'inspect', 'run']) {
    assert.ok(page(step).includes(`curl -sS -X POST https://api.beatapi.io/v1/capabilities/${step}`), `${step}.md has no curl example`);
  }
  assert.match(page('search'), /group_by: "function"/);
  assert.match(page('inspect'), /`runnable`/);
  assert.match(page('inspect'), /schema_hash/);
  assert.match(page('run'), /"view":"preview"/);
  assert.match(page('run'), /idempotency_key/);
  assert.match(page('run'), /poll_after_seconds/);
});

test('examples use references that exist and queries that match', () => {
  assert.match(skill, /"query":"小红书 搜索笔记"/);
  assert.match(page('search'), /"query":"小红书 搜索笔记"/);
  assert.match(page('inspect'), /data:xiaohongshu\.app_v2\.search_notes/);
  assert.match(page('run'), /data:xiaohongshu\.app_v2\.search_notes/);
  for (const [path, text] of everything) {
    assert.doesNotMatch(text, /data:xiaohongshu\.note\.search|data:social\.video\.search/, path);
  }
});

test('key handling is explicit about format and secrecy', () => {
  assert.match(skill, /Never request a key in chat/);
  const billing = page('billing');
  assert.match(billing, /Never request a key in chat/);
  assert.match(billing, /with or without the `sk-` prefix/);
  assert.match(billing, /Configure it privately/);
  assert.match(billing, /GET https:\/\/api\.beatapi\.io\/v1\/usage/);
  assert.match(billing, /Credits are US dollars everywhere/);
});

test('errors branch on retryable and name the key failures', () => {
  assert.match(skill, /error\.retryable/);
  const errors = page('errors');
  assert.match(errors, /Never loop a call whose `retryable` is `false`/);
  assert.match(errors, /missing_api_key/);
  assert.match(errors, /invalid_api_key/);
  assert.match(errors, /insufficient_credits/);
  assert.match(errors, /error\.retry_after_seconds/);
});

test('free models are discovered at run time, never hardcoded', () => {
  const free = page('free-models');
  assert.match(free, /never hardcode ids/);
  assert.match(free, /"query":"free","kind":"model"/);
  assert.match(free, /\$0 input \/ \$0 output per 1M tokens/);
  assert.match(free, /limits\.rate_limit/);
  assert.match(free, /successful_requests_per_minute_before_first_top_up/);
  assert.match(free, /successful_requests_per_minute_after_top_up/);
  assert.match(free, /Read the numbers from Inspect/);
  assert.match(free, /rate_limit_exceeded/);
  assert.match(free, /no stability guarantee/);
  // The one id the page may name is the decision model its recipe covers.
  const ids = new Set([...free.matchAll(/model:([a-z0-9.-]+-free)/g)].map((match) => match[1]));
  assert.deepEqual([...ids], ['jev-1.13-free']);
});
