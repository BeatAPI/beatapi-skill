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
  const image = JSON.parse(
    readFileSync(new URL("assets/image-generation.json", skillRoot), "utf8"),
  );
  const video = JSON.parse(
    readFileSync(new URL("assets/video-generation.json", skillRoot), "utf8"),
  );
  const effect = JSON.parse(
    readFileSync(new URL("assets/effect-task.json", skillRoot), "utf8"),
  );

  assert.equal(auto.compose_mode, "auto");
  assert.equal(manual.compose_mode, "manual");
  assert.equal(ecommerce.aspect_ratio, "9:16");
  assert.equal(ecommerce.duration, 15);
  assert.equal(image.model, "nano-banana");
  assert.equal(video.model, "seedance-2-mini");
  assert.equal(effect.effect_id, "replace-with-effect-id");
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
});

test("the bundled contract contains every operation named by the Skill", () => {
  const contract = readFileSync(
    new URL("references/beatapi.openapi.yaml", skillRoot),
    "utf8",
  );
  for (const operation of [
    "listWorkflows",
    "listGenerationModels",
    "createImageGenerationTask",
    "createVideoGenerationTask",
    "listEffects",
    "getEffect",
    "createEffectTask",
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
  assert.match(commandMap, /beatapi_list_generation_models/);
  assert.match(commandMap, /beatapi_create_image/);
  assert.match(commandMap, /beatapi_create_video/);
  assert.match(commandMap, /beatapi_create_effect/);
  assert.match(commandMap, /beatapi webhooks create/);
  assert.match(commandMap, /beatapi_create_realtime_session/);
  assert.match(commandMap, /beatapi realtime sessions create/);
});

test("generation guidance uses stable aliases and USD compatibility semantics", () => {
  const guidance = readFileSync(
    new URL("references/generation-and-effects.md", skillRoot),
    "utf8",
  );
  const limits = readFileSync(
    new URL("references/credits-and-limits.md", skillRoot),
    "utf8",
  );
  for (const model of [
    "nano-banana",
    "nano-banana-pro",
    "gpt-image-2",
    "seedream-5-pro",
    "minimax-h3",
    "seedance-2",
    "seedance-2-fast",
    "seedance-2-mini",
    "veo-3.1",
    "seedance-2.5",
    "kling-3",
  ]) {
    assert.match(guidance, new RegExp(`\\b${model.replace(".", "\\.")}\\b`));
  }
  assert.match(limits, /USD-denominated/);
  assert.match(limits, /1 Credit = \$1 USD/);
  assert.doesNotMatch(limits, /Music Video 540p standard \| 4 per second/);
});

test("realtime guidance protects the long-lived key and browser boundary", () => {
  const realtime = readFileSync(
    new URL("references/realtime-video.md", skillRoot),
    "utf8",
  );
  assert.match(realtime, /never.*`sk_`.*browser/i);
  assert.match(realtime, /client_secret/);
  assert.match(realtime, /camera.*WebRTC/i);
  assert.match(realtime, /Idempotency-Key/);
});
