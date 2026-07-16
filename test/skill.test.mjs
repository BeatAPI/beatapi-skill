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
  ]) {
    assert.match(contract, new RegExp(`operationId: ${operation}\\b`));
  }
});
