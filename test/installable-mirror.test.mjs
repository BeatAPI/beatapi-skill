import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

// The installable Skill (skills/beatapi-video/) is self-contained, so it carries
// its own copy of the public Skill. The copy is made by hand, by this rule:
//
//   SKILL.md            -> skills/beatapi-video/references/current.md
//                          with the YAML frontmatter block and the blank line
//                          after it removed, otherwise unchanged
//   references/**/*.md  -> skills/beatapi-video/references/<same path>
//                          byte for byte
//
// These tests fail on any drift, so the bundle cannot keep an old text after
// the public one changes.
const root = new URL('../', import.meta.url);
const bundle = new URL('../skills/beatapi-video/', import.meta.url);
const pagePaths = readdirSync(fileURLToPath(new URL('references/', root)), { recursive: true })
  .map((path) => String(path).replaceAll('\\', '/'))
  .filter((path) => path.endsWith('.md'))
  .sort();
const withoutFrontmatter = (markdown) => markdown.replace(/^---\n[\s\S]*?\n---\n\n?/, '');
const refLinks = (text) => [...text.matchAll(/https:\/\/beatapi\.io\/skill-refs\/([^>\s)]+)/g)].map((match) => match[1]);

test('the bundle carries every public page, byte for byte', () => {
  assert.ok(pagePaths.length > 0, 'no pages found under references/');
  for (const path of pagePaths) {
    const copy = new URL(`references/${path}`, bundle);
    assert.ok(existsSync(copy), `skills/beatapi-video/references/${path} is missing: copy references/${path} there`);
    assert.ok(
      readFileSync(copy).equals(readFileSync(new URL(`references/${path}`, root))),
      `skills/beatapi-video/references/${path} differs from references/${path}: copy the root file over it`,
    );
  }
});

test('the bundled index is SKILL.md without its frontmatter', () => {
  const skill = readFileSync(new URL('SKILL.md', root), 'utf8');
  const expected = withoutFrontmatter(skill);
  assert.notEqual(expected, skill, 'SKILL.md has no frontmatter to strip');
  assert.ok(expected.startsWith('# '), 'SKILL.md must continue with its title after the frontmatter');
  assert.ok(
    readFileSync(new URL('references/current.md', bundle), 'utf8') === expected,
    'skills/beatapi-video/references/current.md differs from SKILL.md minus its frontmatter: regenerate it',
  );
});

test('every page the bundled index links has a local copy', () => {
  const links = refLinks(readFileSync(new URL('references/current.md', bundle), 'utf8'));
  assert.ok(links.length > 0, 'the bundled index links no pages');
  for (const link of links) {
    assert.ok(existsSync(new URL(`references/${link}`, bundle)), `the bundle has no references/${link}`);
  }
});

test('the installable SKILL.md sends the agent to the local index and pages', () => {
  const installable = readFileSync(new URL('SKILL.md', bundle), 'utf8');
  for (const name of ['current', 'search', 'inspect', 'run', 'errors', 'billing', 'free-models', 'web-search']) {
    assert.ok(installable.includes(`(references/${name}.md)`), `skills/beatapi-video/SKILL.md does not link references/${name}.md`);
  }
  // The pages keep their public URLs; the agent is told where the local copy is.
  assert.match(installable, /`https:\/\/beatapi\.io\/skill-refs\/<path>`\s+page it links is bundled here as `references\/<path>`/);
});
