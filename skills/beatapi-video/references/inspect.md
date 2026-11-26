# Inspect: read a capability's contract

Read this when you need a capability's inputs, readiness, price tiers or
`schema_hash`. Step 2 of the Search → Inspect → Run loop in the main Skill
(<https://beatapi.io/skill.md>). Inspect needs no key.

```sh
curl -sS -X POST https://api.beatapi.io/v1/capabilities/inspect \
  -H 'Content-Type: application/json' -d '{"reference":"data:xiaohongshu.app_v2.search_notes"}'
```

Over MCP, pass the same JSON to `capabilities_inspect`.

Read `input_schema` (required fields, types, limits), `pricing`, `execution.mode`
(`sync` answers directly, `async` returns a task) and `readiness`:

| readiness | meaning |
| --- | --- |
| `ready` | input, output and price are published |
| `runnable` | runs; the output shape is not published, so read what you need from `data` |
| `listed` | cannot run through Run; `next` says why. Search for an alternative |

`pricing.price_usd` is the cheapest published shape (a Search card shows it as
"from $…"); `pricing.tiers` lists every shape with its price (veo-3.1: Lite
$0.15, Quality $1.85 for the same 8 s). Pick the tier before a paid run; the
task's `credits_reserved` is that tier's price.

A `model:` contract also carries `requires_topup` (see Search): `true` means an
account that has never topped up is refused it with 403 `forbidden`; `false`
only means at least one tier is open.

A tier may carry `surcharges`, a list of `{unit, spec, price_usd}`: what each
extra item adds on top of that tier's `price_usd`. `unit` is `reference_image`,
`reference_video_second` or `element`. For reference video the price is relative
to the 8 seconds the quoted tier already includes, so the figure is the step
from 8 to 9 seconds. Where a charge is not linear in the count, `spec` says so.
Budget a run as the tier price plus the surcharges for the extras you send.

A guessed or misspelled reference returns 404 with `suggestions`. `schema_hash`
fingerprints `input_schema` and `output_schema` together: cache a contract by it,
and re-inspect only when a later reply shows a different hash.
