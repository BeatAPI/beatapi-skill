---
name: beatapi
description: Connect an Agent to BeatAPI's Model, Data, and Workflow capabilities through the unified Search, Inspect, and Run interface.
---

# BeatAPI

BeatAPI is a provider-neutral capability API. It gives an Agent one way to
discover and call models, Social Data actions, and workflows. The Agent sends
BeatAPI capability IDs and the user's BeatAPI key; provider names, upstream
URLs, and provider credentials stay inside the platform.

## Set up

1. Create or copy a BeatAPI API key at <https://beatapi.io/dashboard/apikeys>.
2. Store it in the host's secret or MCP configuration as `BEATAPI_API_KEY`.
   Never put the key in a prompt, source file, issue, or tool argument.
3. If the host supports remote MCP, connect it to `https://beatapi.io/mcp`.
   If it supports local Agent Skills, install the `beatapi-video` folder from
   <https://github.com/BeatAPI/beatapi-skill>.
4. Verify the connection with `capabilities_search` or the REST request below.

The REST base URL is `https://api.beatapi.io`. REST users do not need MCP or a
Skill installation.

## The three-step loop

Always use this order when the capability or its input is unfamiliar:

1. **Search** (`capabilities_search`) — find a small set of candidates.
2. **Inspect** (`capabilities_inspect`) — read the exact input schema, output schema, pagination,
   limits, execution mode, and validation state.
3. **Run** (`capabilities_run`) — start the capability with the inspected input. For an asynchronous
   run, poll its task with `operation: "status"`.

Capability references are provider-neutral:

```text
model:<public-model-id>
data:<public-action-id>
workflow:<public-workflow-id>
```

Do not guess action IDs or parameters, and do not send supplier-native routes.

## REST examples

```bash
curl https://api.beatapi.io/v1/capabilities/search \
  -H "Authorization: Bearer $BEATAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"小红书 笔记搜索","kind":"data","limit":5}'

curl https://api.beatapi.io/v1/capabilities/inspect \
  -H "Authorization: Bearer $BEATAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"reference":"data:xiaohongshu.note.search"}'

curl https://api.beatapi.io/v1/capabilities/run \
  -H "Authorization: Bearer $BEATAPI_API_KEY" \
  -H "Idempotency-Key: example-001" \
  -H "Content-Type: application/json" \
  -d '{"reference":"data:xiaohongshu.note.search","operation":"start","input":{"keyword":"AI 视频"},"idempotency_key":"example-001"}'
```

For an asynchronous task, call
`POST /v1/capabilities/run/status` with the inspected reference and returned
`task_id`. Reuse the same idempotency key when retrying the same start request.

## Social Data

Social Data uses the same loop as Model and Workflow capabilities. Search with
`kind: "data"`, inspect the returned `data:<action-id>`, then run it. The
human and machine-readable action catalog is at
<https://beatapi.io/social-data-catalog.json>. It contains the input schema,
output schema, pagination rules, limits, and availability for each published
action. Do not use provider-native URLs, paths, or credentials.

## Safety and billing

Search and Inspect are read-only. Run may consume credits and may create an
asynchronous task. Check the returned task state and only report a result after
the task succeeds. Failed requests do not represent completed output; preserve
the request ID and error details for retries or support.

Existing REST endpoints, the OpenAPI contract, the official CLI, and the
`beatapi-video` Skill remain supported. This page is the shortest setup and
capability-loop reference for Agents.
