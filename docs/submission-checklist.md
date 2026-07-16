# Skill directory submission checklist

## Artifact

- Repository: `https://github.com/erickkkyt/beatapi-skill`
- Skill directory: `skills/beatapi-video`
- Upload ZIP: `dist/beatapi-video-skill.zip` after
  `npm run submission:build`
- Skill name: `beatapi-video`
- Invocation: `$beatapi-video`
- License: MIT
- Product documentation: `https://beatapi.io/docs`
- API key creation: `https://beatapi.io/dashboard/apikeys`

## Before submission

1. Run `npm run contract:sync` against the reviewed BeatAPI public contract.
2. Run `npm run verify`.
3. Run the official host validator when the target directory provides one.
4. Confirm the repository is public and the default branch is `main`.
5. Confirm the Skill folder has no symlinks, generated caches, private media,
   credentials, or repository-only relative references.
6. Test a fresh clone with the eight prompts in `evals/evals.json`.
7. Confirm `beatapi` CLI installation and authentication instructions are
   current.
8. Capture the repository URL, one-sentence description, categories, and
   support/security links required by the directory form.

## Suggested listing copy

**Name:** BeatAPI Video

**Short description:** Create and manage BeatAPI AI video workflows.

**Long description:** Create AI music videos and ecommerce product ads through
BeatAPI. The Skill safely uploads local media, checks credits and concurrency,
supports automatic or manual storyboard composition, waits for asynchronous
tasks, retrieves hosted output, manages webhooks, and preserves structured
errors without exposing API keys.

**Categories:** Video, Developer Tools, Automation, AI Media

## Release evidence

Attach or link:

- successful CI run;
- contract SHA from `contract/contract.lock.json`;
- official Skill validator output;
- clean secret scan;
- screenshots only if they contain no credentials or private media.
