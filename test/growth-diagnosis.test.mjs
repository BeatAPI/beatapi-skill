import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('a company research request discovers the public diagnosis and its HTML deliverable', () => {
  const entry = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');
  const recipe = readFileSync(new URL('../references/recipes/growth-diagnosis.md', import.meta.url), 'utf8');
  assert.ok(entry.includes('https://beatapi.io/skill-refs/recipes/growth-diagnosis.md'));
  assert.match(recipe, /standalone HTML report/);
  assert.match(recipe, /first-party data/);
});
