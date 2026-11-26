# BeatAPI command and endpoint map

Base URL: `https://api.beatapi.io`

Authentication: Bearer API key for mutations and account data. Workflow,
generation-model, and Effect discovery endpoints are anonymous. Text-model
discovery requires authentication.
Prefer bundled MCP tools when available. Otherwise use the CLI so credential
handling and output separation stay consistent.

| Intent | MCP tool | CLI | HTTP |
| --- | --- | --- | --- |
| Check setup | `beatapi_check_setup` | `beatapi auth status` | `GET /v1/usage` |
| Discover workflows | `beatapi_list_workflows` | `beatapi workflows list` | `GET /v1/workflows` |
| Discover text models | `beatapi_list_text_models` | Client/OpenAPI | `GET /v1/models` |
| Create text response | `beatapi_create_text_response` | Client/OpenAPI | `POST /v1/responses` |
| Discover generation models | `beatapi_list_generation_models` | `beatapi models list` | `GET /v1/media/models` |
| Create image task | `beatapi_create_image` | `beatapi images create --file INPUT` | `POST /v1/images/tasks` |
| Create video task | `beatapi_create_video` | `beatapi videos create --file INPUT` | `POST /v1/videos/tasks` |
| List Effects | `beatapi_list_effects` | `beatapi effects list` | `GET /v1/effects` |
| Read Effect | `beatapi_get_effect` | `beatapi effects get EFFECT` | `GET /v1/effects/{effect_id}` |
| Create Effect task | `beatapi_create_effect` | `beatapi effects create --file INPUT` | `POST /v1/effects/tasks` |
| Analyze video | `beatapi_analyze_video` | Client/OpenAPI | `POST /v1/video-analysis/tasks` |
| Check usage | `beatapi_get_usage` | `beatapi usage` | `GET /v1/usage` |
| Upload local media | `beatapi_upload_file` | `beatapi files upload PATH` | `POST /v1/files` |
| Create Music Video | `beatapi_create_music_video` | `beatapi music-video create --file INPUT` | `POST /v1/music-video/tasks` |
| Edit storyboard shot | `beatapi_edit_music_video_shot` | `beatapi music-video shots edit TASK SHOT --prompt TEXT` | `POST /v1/music-video/tasks/{task_id}/shots/{shot_id}/edit` |
| Get/materialize shot media | `beatapi_get_music_video_shot_media` | `beatapi music-video shots media TASK SHOT` | `POST /v1/music-video/tasks/{task_id}/shots/{shot_id}/media` |
| Compose selected shots | `beatapi_compose_music_video` | `beatapi music-video compose TASK --shot SHOT` | `POST /v1/music-video/tasks/{task_id}/compose` |
| Create Ecommerce Video | `beatapi_create_ecommerce_video` | `beatapi ecommerce-video create --file INPUT` | `POST /v1/ecommerce-video/tasks` |
| Create Realtime session | Not agent-exposed; use trusted server-side code | Not allowed in Skills-only mode | `POST /v1/realtime/sessions` |
| Read Realtime session | `beatapi_get_realtime_session` | `beatapi realtime sessions get SESSION` | `GET /v1/realtime/sessions/{session_id}` |
| Close Realtime session | `beatapi_close_realtime_session` | `beatapi realtime sessions close SESSION` | `DELETE /v1/realtime/sessions/{session_id}` |
| Read task | `beatapi_get_task` | `beatapi tasks get TASK` | `GET /v1/tasks/{task_id}` |
| List tasks | Not agent-exposed | Client/OpenAPI | `GET /v1/tasks` |
| Wait for task | `beatapi_wait_for_task` | `beatapi tasks wait TASK` | Repeated task lookup |
| List webhooks | `beatapi_list_webhooks` | `beatapi webhooks list` | `GET /v1/webhooks` |
| Create webhook | Not agent-exposed; use trusted server-side code or dashboard | Not allowed in Skills-only mode | `POST /v1/webhooks` |
| Read webhook | `beatapi_get_webhook` | `beatapi webhooks get ID` | `GET /v1/webhooks/{id}` |
| Update webhook | `beatapi_update_webhook` | `beatapi webhooks update ID --file INPUT` | `PATCH /v1/webhooks/{id}` |
| Delete webhook | `beatapi_delete_webhook` | `beatapi webhooks delete ID` | `DELETE /v1/webhooks/{id}` |

The CLI writes result JSON to stdout and progress/errors to stderr. Use
`--json` only as a compatibility alias for `--file`.

## Task lifecycle

Automatic flow:

```text
queued -> processing -> succeeded
                     -> failed
```

Manual Music Video can include:

```text
queued -> processing -> storyboard_ready/requires_action
       -> editing -> storyboard_ready/requires_action
       -> composing -> succeeded/failed
```

Poll every 5-10 seconds with jitter and a bounded attempt count. Read the
result from `data.output.url` (the primary asset: the first video, else the
first image); `data.output.media[]` lists every hosted file and `r2_url` is the
old name of `url`.

`GET /v1/tasks` lists the account's tasks, newest first, in the same shape as
the task lookup. Filters: `status` (`queued`, `processing`, `succeeded`,
`failed`), `model`, `created_after`, `created_before`, `api_key_id` and `limit`
(1-100); pass `next_cursor` back as `cursor` for the next page. Calls that answer
inside the response (social data, web, SEO, text) are not tasks and are not
listed.

`callback_url` is accepted only by `POST /v1/images/tasks` and
`POST /v1/videos/tasks`: a public HTTPS URL that shares scheme, host and port
with an already registered, enabled webhook endpoint, whose secret signs the
delivery. Enum values are matched ignoring case; write the canonical spelling
from the contract (`1080p`, `4K`, `fast`).

For exact schemas, enums, examples, and response shapes, read
`beatapi.openapi.yaml` in this directory.
