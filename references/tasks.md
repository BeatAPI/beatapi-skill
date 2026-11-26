# Tasks: results, listing, callbacks and enum spelling

Read this when you read a finished task, list tasks, want a callback instead of
polling, or wonder how to spell an enum value. The main Skill is
<https://beatapi.io/skill.md>. Needs the key.

- **Result**: a succeeded image or video task has `output.url`, the primary
  asset (the first video, else the first image). `output.media[]` lists every
  output file; `output.r2_url` is the old name of `url`, with the same value.
- **List tasks** (REST): `GET https://api.beatapi.io/v1/tasks` returns the
  account's image, video and workflow tasks, newest first, each in the shape of
  the status call. Filters: `status` (`queued`, `processing`, `succeeded`,
  `failed`; repeat it or separate with commas), `model`, `created_after`,
  `created_before`, `api_key_id` (tasks made with one key; a key that is not
  yours gives an empty list) and `limit` (1-100, default 20). Send the previous
  `next_cursor` as `cursor` for the next page; the last page has none, and an
  edited cursor is 400 `bad_request`. `status` follows the lifecycle, so
  `processing` also matches a workflow stage such as `storyboard_ready`. Sync
  calls (social data, web, SEO, text models) are not tasks and never appear.
- **Callback**: only the image and video create endpoints (`POST /v1/images/tasks`,
  `POST /v1/videos/tasks`) accept `callback_url`, a public HTTPS URL for that one
  task. It must share scheme, host and port with a webhook endpoint you have
  already registered and enabled (`POST /v1/webhooks`); that endpoint's secret
  signs the `task.succeeded` / `task.failed` delivery. Run, workflows and
  effects do not take it. Polling stays the source of truth.
- **Enum spelling**: enum values (`resolution`, `quality`, ...) are matched
  ignoring case, so older spellings (`1080P`, `4k`, `Fast`, `Quality`) are still
  accepted. Write the spelling Inspect lists (`1080p`, `4K`, `fast`); this Skill
  uses only that one.

A failed call or task: <https://beatapi.io/skill-refs/errors.md>.
