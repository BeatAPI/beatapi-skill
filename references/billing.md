# Keys, balance, usage and cost

Read this to handle the API key, check the balance, read usage, or report what
a call cost. The main Skill is <https://beatapi.io/skill.md>.

## The API key

- Configure it privately: the host's secret field for the MCP server
  `https://beatapi.io/mcp`, or the environment variable `BEATAPI_API_KEY`.
  Never request a key in chat, print it, or put it in a URL or file.
- Send it as `Authorization: Bearer <key>`. Keys look like `sk-…`; the key works
  with or without the `sk-` prefix. Do not add a second prefix.
- Get a key: <https://beatapi.io/dashboard/apikeys>. Search and Inspect need no key.

## Balance and usage

- `GET https://api.beatapi.io/v1/usage` with the key returns `credit_balance`;
  check it before a large batch.
- Add `?period=7d` (`24h`, `7d`, `30d`; default `all`) to read the spend of a
  window; the reply repeats `period`, `since` and `until`. Any other query
  parameter is refused with 400.
- Credits are US dollars everywhere (`credit_balance`, `credits_reserved`,
  `credits_settled`, `price_usd`).

## What a call cost

- Report cost from the response's `usage` (`price_usd`, sync calls) or the
  task's `credits_settled`; both are US dollars.

## Token-billed image models

- An image model whose ID ends in `-token` (`gpt-image-2-token`,
  `nano-banana-2-token`, …) is its base model billed by the tokens each image
  uses, not a flat price per image. Same request fields as the base model.
- `credits_reserved` is the estimate held when the task is created;
  `credits_settled` is the tokens the render actually used, so the two can
  differ. A failed task is not charged. Rates per 1M tokens and per-image
  estimates: <https://beatapi.io/pricing>.
- The GPT ones take an optional `quality` (Inspect lists the levels; default
  `medium`) that sets the output tokens and so the price. Their fixed-price
  GPT models refuse `quality`; the Nano Banana ones have no `quality`.
- Async only: run them like any image task and poll until `succeeded`. There is
  no synchronous `/v1/images/generations` for them.

## GPT Image 2.6 (-beta and official)

- Naming: a `-beta` suffix marks a lower-cost version served through
  third-party lines at a fixed price per image; the bare name is the official
  version, billed per token.
- `gpt-image-2.6-flare-beta` and `gpt-image-2.6-sunburst-beta` are billed a
  fixed price per image: a PNG by resolution tier (1K, 2K or 4K); a GIF is
  billed one price per GIF, whatever its size. They take `output_format`
  `png` (default) or `gif`, and have no `background` and no `quality`.
  Prices: <https://beatapi.io/pricing>.
- `gpt-image-2.6-flare` and `gpt-image-2.6-sunburst` are the official version,
  billed by tokens like the `-token` models above, at 90% of OpenAI's list
  price (list per 1M tokens: text input $5, image input $8, image output $30).
  They take the optional `quality` (`low`, `medium`, `high`, `xhigh`, `max`;
  default `medium`), which sets the output tokens and so the price, and
  `output_format` `png` or `gif`. Async only, like the `-token` models.
- A GIF is a short animation made from the prompt alone: send no `images`;
  `n` is 1.
  - On the `-beta` models the spec is fixed by the model (each side about
    300-1024 px, 8-9 frames): send no `size`, `resolution` or `aspect_ratio`;
    `frame_count` and `frame_duration_ms` are not fields.
  - On the official models `size` is honoured (each frame edge up to about
    960 px); a GIF is always 9 frames of 200 ms, so `frame_count` and
    `frame_duration_ms` are not supported.

Balance too low (402) or a rejected key (401): <https://beatapi.io/skill-refs/errors.md>.
Connecting a host: <https://beatapi.io/skill-refs/setup.md>.
