# Free models

Read this when the user wants a free model, or a free model answers 429. The
main Skill is <https://beatapi.io/skill.md>.

The set of free models changes without notice; never hardcode ids. List what is
free right now with Search:

```sh
curl -sS -X POST https://api.beatapi.io/v1/capabilities/search \
  -H 'Content-Type: application/json' -d '{"query":"free","kind":"model"}'
```

- A card whose `price` reads `$0 input / $0 output per 1M tokens` is free.
  Today their ids end in `-free`.
- A free model runs like any text model:
  `{"reference":"model:<id>","input":{"input":"<prompt>"}}`. The same id also
  works on `/v1/chat/completions` and `/v1/responses`.
- Inspect shows its limit under `limits.rate_limit`:
  `successful_requests_per_minute_before_first_top_up` (1) and
  `successful_requests_per_minute_after_top_up` (10), counted per account apart
  from the normal rate limit. Read the numbers from Inspect rather than from
  this page.
- A 429 on a free model carries code `rate_limit_exceeded`: wait
  `error.retry_after_seconds`, or Search for the paid model of the same family
  (its id is not always the free id minus `-free`).
- A `model:` card and Inspect carry `requires_topup`: `true` means an account
  that has never topped up is refused the model with 403 `forbidden`; `false`
  only means at least one tier is open, not that every call passes.
- Free models are a limited-time offer: callable right after signup, with no
  top-up and no card required.
