import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const skillRoot = new URL("../skills/beatapi-video/", import.meta.url);

test("release validator accepts the installable Skill", () => {
  const output = execFileSync(
    process.execPath,
    [fileURLToPath(new URL("../scripts/validate-skill.mjs", import.meta.url))],
    { encoding: "utf8" },
  );
  assert.match(output, /Validated beatapi-video Skill/);
});

test("templates preserve automatic, manual, and ecommerce intent", () => {
  const auto = JSON.parse(
    readFileSync(new URL("assets/music-video.auto.json", skillRoot), "utf8"),
  );
  const manual = JSON.parse(
    readFileSync(new URL("assets/music-video.manual.json", skillRoot), "utf8"),
  );
  const ecommerce = JSON.parse(
    readFileSync(new URL("assets/ecommerce-video.json", skillRoot), "utf8"),
  );

  assert.equal(auto.compose_mode, "auto");
  assert.equal(manual.compose_mode, "manual");
  assert.equal(ecommerce.aspect_ratio, "9:16");
  assert.equal(ecommerce.duration, 15);
});

test("eval suite covers paid, read-only, manual, auth, and non-trigger cases", () => {
  const evals = JSON.parse(
    readFileSync(new URL("evals/evals.json", skillRoot), "utf8"),
  );
  const prompts = evals.evals.map((evaluation) => evaluation.prompt).join("\n");

  assert.match(prompts, /Go ahead and create it/);
  assert.match(prompts, /review and choose the storyboard/);
  assert.match(prompts, /Don't create anything new/);
  assert.match(prompts, /not authenticated/);
  assert.match(prompts, /Trim the first 10 seconds/);
  assert.match(prompts, /explicitly asked for BeatAPI text/);
  assert.match(prompts, /Analyze this product-demo video/);
});

test("the bundled contract contains every operation named by the Skill", () => {
  const contract = readFileSync(
    new URL("references/beatapi.openapi.yaml", skillRoot),
    "utf8",
  );
  for (const operation of [
    "listWorkflows",
    "getUsage",
    "uploadFile",
    "createMusicVideoTask",
    "editMusicVideoShot",
    "getMusicVideoShotMedia",
    "composeMusicVideoTask",
    "createEcommerceVideoTask",
    "getTask",
    "listWebhookEndpoints",
    "createWebhookEndpoint",
    "getWebhookEndpoint",
    "updateWebhookEndpoint",
    "deleteWebhookEndpoint",
    "createRealtimeSession",
    "getRealtimeSession",
    "closeRealtimeSession",
    "listTextModels",
    "createTextResponse",
    "createImageGenerationTask",
    "createVideoGenerationTask",
    "listEffects",
    "getEffect",
    "createEffectTask",
    "createVideoAnalysisTask",
  ]) {
    assert.match(contract, new RegExp(`operationId: ${operation}\\b`));
  }
});

test("the Skill prefers bundled MCP tools and retains a CLI fallback", () => {
  const skill = readFileSync(new URL("SKILL.md", skillRoot), "utf8");
  const commandMap = readFileSync(
    new URL("references/api-workflows.md", skillRoot),
    "utf8",
  );

  assert.match(skill, /Prefer the bundled BeatAPI MCP tools/);
  assert.match(skill, /beatapi_check_setup/);
  assert.match(skill, /fall back to the official `beatapi` CLI/);
  assert.match(commandMap, /beatapi_create_music_video/);
  assert.match(commandMap, /Create webhook.*Not agent-exposed/);
  assert.match(commandMap, /Create Realtime session.*Not agent-exposed/);
  assert.doesNotMatch(commandMap, /beatapi webhooks create/);
  assert.doesNotMatch(commandMap, /beatapi realtime sessions create/);
  assert.match(commandMap, /beatapi_list_text_models/);
  assert.match(commandMap, /beatapi_create_text_response/);
  assert.match(commandMap, /beatapi_analyze_video/);
});

test("credential setup uses host configuration and never asks for a key in chat", () => {
  const skill = readFileSync(new URL("SKILL.md", skillRoot), "utf8");

  assert.match(skill, /Configure.*BEATAPI_API_KEY/i);
  assert.match(skill, /Never request a key in chat/i);
  assert.doesNotMatch(skill, /paste (?:the|your) (?:API )?key (?:here|into chat)/i);
});

test("text generation requires explicit BeatAPI intent", () => {
  const skill = readFileSync(new URL("SKILL.md", skillRoot), "utf8");

  assert.match(skill, /only when the user explicitly asks.*BeatAPI text/i);
  assert.match(skill, /beatapi_create_text_response/);
  assert.match(skill, /stream.*false/i);
});

test("realtime guidance protects the long-lived key and browser boundary", () => {
  const realtime = readFileSync(
    new URL("references/realtime-video.md", skillRoot),
    "utf8",
  );
  assert.match(realtime, /Never put\s+.*`sk_`.*browser/is);
  assert.match(realtime, /client_secret/);
  assert.match(realtime, /camera.*WebRTC/i);
  assert.match(realtime, /Idempotency-Key/);
});
