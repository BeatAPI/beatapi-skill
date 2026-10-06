# Contributing

1. Fork the repository and create a focused branch.
2. Keep `SKILL.md` concise and move detailed API material into `references/`.
3. Mirror every change to `SKILL.md` or `references/` into the installable
   Skill: copy `references/<path>` to `skills/beatapi-video/references/<path>`
   unchanged, and `SKILL.md` to `skills/beatapi-video/references/current.md`
   without its frontmatter block. `npm test` fails on drift.
4. Do not hand-edit generated contract references.
5. Run `npm run contract:sync` after a reviewed BeatAPI OpenAPI update.
6. Run `npm run verify` before opening a pull request.
7. Never include real API keys, user media, or private task data.

Changes to workflow behavior must include a matching test prompt or structural
test.

