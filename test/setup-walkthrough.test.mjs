import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');

// The core Skill is read by every agent, including weak ones with small
// contexts. Detail belongs in references/ (published at /skill-refs/).
test('the core Skill stays small enough for weak agents', () => {
  assert.ok(skill.split('\n').length < 200, `SKILL.md has ${skill.split('\n').length} lines`);
  assert.ok(Buffer.byteLength(skill) < 11_000, `SKILL.md is ${Buffer.byteLength(skill)} bytes`);
});

test('one loop for every capability, driven by the next field', () => {
  for (const tool of ['capabilities_search', 'capabilities_inspect', 'capabilities_run',
    'web_search', 'web_read', 'web_map', 'web_research']) {
    assert.ok(skill.includes(tool), `missing MCP tool ${tool}`);
  }
  assert.match(skill, /Every response has a `next` field/);
  assert.match(skill, /never invent one/);
  assert.match(skill, /"operation":"status","task_id"/);
  assert.doesNotMatch(skill, /\/v1\/capabilities\/run\/status/);
  // Text and decision models run through the same Run call.
  assert.match(skill, /"reference":"model:<id>","input":\{"input":"<prompt>"\}/);
  assert.match(skill, /output_text/);
  assert.match(skill, /model:jev-1\.13-free/);
  assert.match(skill, /at most 10 criteria/);
  assert.doesNotMatch(skill, /direct_api|run_supported: `false`/);
});

test('examples use references that exist and queries that match', () => {
  assert.match(skill, /"query":"小红书 搜索笔记"/);
  assert.match(skill, /data:xiaohongshu\.app_v2\.search_notes/);
  assert.doesNotMatch(skill, /data:xiaohongshu\.note\.search|data:social\.video\.search/);
});

test('key handling is explicit about format and secrecy', () => {
  assert.match(skill, /Never request a key in chat/);
  assert.match(skill, /with or without the `sk-` prefix/);
  assert.match(skill, /Configure it privately/);
  assert.match(skill, /missing_api_key/);
  assert.match(skill, /invalid_api_key/);
});

test('every linked reference page exists in references/', () => {
  const links = [...skill.matchAll(/https:\/\/beatapi\.io\/skill-refs\/([^>\s)]+)/g)].map((match) => match[1]);
  assert.ok(links.length >= 5, 'expected recipe and reference links');
  for (const link of links) {
    assert.ok(existsSync(new URL(`../references/${link}`, import.meta.url)), `missing references/${link}`);
  }
});
