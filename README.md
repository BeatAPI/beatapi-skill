# BeatAPI Skill

Official Agent Skill for BeatAPI's asynchronous Music Video and Ecommerce
Video APIs.

The repository follows the open Agent Skills directory format. The installable
Skill lives at:

```text
skills/beatapi-video/
```

It teaches compatible coding agents how to inspect media, choose a BeatAPI
workflow, check account usage, create an asynchronous video task through the
BeatAPI CLI, handle storyboard actions, wait for completion, and return hosted
output.

## Requirements

- A BeatAPI account and customer API key
- The BeatAPI CLI installed and authenticated
- An Agent Skills-compatible host

Create a key at <https://beatapi.io/dashboard/apikeys>. The Skill never asks
users to paste the key into a conversation and never stores credentials itself.

## Local installation

Copy or symlink `skills/beatapi-video` into your agent's user or repository
Skills directory. For Codex user-level installation:

```bash
mkdir -p ~/.agents/skills
ln -s /absolute/path/to/beatapi-skill/skills/beatapi-video \
  ~/.agents/skills/beatapi-video
```

For installable Codex distribution, use the separate
`beatapi-codex-plugin` project.

## Contract

The Skill is locked to the reviewed BeatAPI OpenAPI contract in
`contract/beatapi.openapi.yaml`. Refresh it from the sibling
`beatapi-examples` checkout:

```bash
npm run contract:sync
npm run verify
```

## Security

Do not put API keys in prompts, issue reports, screenshots, fixtures, or Skill
files. See [SECURITY.md](SECURITY.md).

