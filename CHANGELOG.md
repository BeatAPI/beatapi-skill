# Changelog

## 0.3.0 — 2026-10-02

- Ship current capability, result-view and Web guidance in the installable Skill and synchronize its OpenAPI.


## [Unreleased]

### Changed

- Split the core `SKILL.md` into an index (66 lines, 3.6 KB, was 196 lines,
  11 KB) plus stand-alone pages under `references/`: `search.md`, `inspect.md`,
  `run.md`, `errors.md` and `billing.md` carry the former sections unchanged in
  substance, each under 4.5 KB. The index keeps the three-call loop, the `next`
  rule, the transport table, key handling, the rules that always apply and a
  table of which page to open; an agent that opens no page can still finish by
  following `next`.
- Add `references/free-models.md`: list what is free right now through Search,
  read the limit from Inspect, and what a 429 on a free model means.
- Rewrite the core `SKILL.md` for weak agents (about 7 KB, was 21 KB): one
  Search → Inspect → Run loop for every capability, a transport table, key
  format, copy-the-`next`-field guidance, text and JEV models through Run, and
  an error table. Setup, web search and recipes move to `references/`, which
  BeatAPI publishes under `https://beatapi.io/skill-refs/`.
- Add recipes: 小红书 topic research, competitor accounts, JEV decisions.
- Fix the Social Data example that searched for a phrase with no match and
  inspected a reference that does not exist.

- Synchronize the bundled OpenAPI contract with current capability, Social
  Data, onboarding, text, image, video, Effect, Workflow, and Realtime routes.
- Position the Skill around BeatAPI's Model/Data/Workflow capability layer and
  the Hosted MCP Search → Inspect → Run interface while retaining focused local
  plugin and CLI fallbacks.
- Update setup guidance for the published 0.3.0 CLI and current dynamic catalog.

## [0.2.0] - 2026-07-31

### Added

- Realtime Video session create, read, and close guidance for MCP and CLI.
- Browser/server credential boundaries, billing activation semantics, and
  Realtime limits.

### Changed

- Synchronize the installable contract to the current public OpenAPI baseline.
- Prefer bundled BeatAPI MCP tools while retaining the official CLI fallback.

## [0.1.0] - 2026-07-17

### Added

- Self-contained `beatapi-video` Agent Skill.
- Automatic and manual Music Video orchestration.
- Ecommerce Video, task polling, file upload, usage, and webhook guidance.
- Credit, limit, recovery, and credential-safety references.
- Safe request templates and eight forward-testing scenarios.
- OpenAPI contract lock, structural validator, tests, and CI.

[Unreleased]: https://github.com/BeatAPI/beatapi-skill/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/BeatAPI/beatapi-skill/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/BeatAPI/beatapi-skill/releases/tag/v0.1.0
