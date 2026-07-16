import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skill = resolve(root, "skills/beatapi-video");
const skillFile = resolve(skill, "SKILL.md");

function fail(message) {
  throw new Error(message);
}

function read(path) {
  if (!existsSync(path)) fail(`Missing required file: ${path}`);
  return readFileSync(path, "utf8");
}

const markdown = read(skillFile);
const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n/);
if (!frontmatterMatch) fail("SKILL.md must start with YAML frontmatter.");

const frontmatter = Object.fromEntries(
  frontmatterMatch[1]
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator < 1) fail(`Invalid frontmatter line: ${line}`);
      return [
        line.slice(0, separator).trim(),
        line.slice(separator + 1).trim(),
      ];
    }),
);
const frontmatterKeys = Object.keys(frontmatter).sort();
if (frontmatterKeys.join(",") !== "description,name") {
  fail("SKILL.md frontmatter may contain only name and description.");
}
if (frontmatter.name !== "beatapi-video") {
  fail("Skill name and directory must both be beatapi-video.");
}
if (!frontmatter.description?.includes("Use when")) {
  fail("Skill description must explain when the Skill triggers.");
}
if (markdown.split("\n").length > 500) {
  fail("SKILL.md must stay below 500 lines.");
}

const openaiYaml = read(resolve(skill, "agents/openai.yaml"));
const shortDescription = openaiYaml.match(
  /short_description:\s*"([^"]+)"/,
)?.[1];
if (
  !shortDescription ||
  shortDescription.length < 25 ||
  shortDescription.length > 64
) {
  fail("openai.yaml short_description must contain 25-64 characters.");
}
if (!/default_prompt:\s*"Use \$beatapi-video\b/.test(openaiYaml)) {
  fail("openai.yaml default_prompt must explicitly invoke $beatapi-video.");
}

const linkedResources = [
  ...markdown.matchAll(/\((references\/[^)]+)\)/g),
  ...markdown.matchAll(/`(assets\/[^`]+)`/g),
].map((match) => match[1]);
for (const relativePath of linkedResources) {
  if (!existsSync(resolve(skill, relativePath))) {
    fail(`SKILL.md links to missing resource: ${relativePath}`);
  }
}

const requiredCommands = [
  "beatapi auth status",
  "beatapi workflows list",
  "beatapi usage",
  "beatapi files upload",
  "beatapi music-video create --file",
  "beatapi ecommerce-video create --file",
  "beatapi tasks wait",
];
for (const command of requiredCommands) {
  if (!markdown.includes(command)) fail(`Missing CLI guidance: ${command}`);
}

for (const asset of [
  "music-video.auto.json",
  "music-video.manual.json",
  "ecommerce-video.json",
  "webhook.json",
]) {
  JSON.parse(read(resolve(skill, "assets", asset)));
}

const evals = JSON.parse(read(resolve(skill, "evals/evals.json")));
if (evals.skill_name !== "beatapi-video" || evals.evals?.length < 8) {
  fail("Skill evals must contain at least eight beatapi-video scenarios.");
}
for (const evaluation of evals.evals) {
  if (
    !evaluation.prompt ||
    !evaluation.expected_output ||
    !Array.isArray(evaluation.assertions) ||
    evaluation.assertions.length < 3
  ) {
    fail(`Invalid evaluation scenario: ${evaluation.id}`);
  }
}

const rootContract = readFileSync(
  resolve(root, "contract/beatapi.openapi.yaml"),
);
const skillContract = readFileSync(
  resolve(skill, "references/beatapi.openapi.yaml"),
);
if (!rootContract.equals(skillContract)) {
  fail("Installable Skill contract differs from the repository contract.");
}
const lock = JSON.parse(read(resolve(root, "contract/contract.lock.json")));
const digest = createHash("sha256").update(skillContract).digest("hex");
if (lock.sha256 !== digest) fail("Installable Skill contract hash is stale.");

const searchable = [
  markdown,
  openaiYaml,
  ...linkedResources.map((path) => read(resolve(skill, path))),
].join("\n");
if (
  /(sk_(?:live|prod|test)?_[A-Za-z0-9]{12,}|gh[opsu]_[A-Za-z0-9]{20,}|npm_[A-Za-z0-9]{20,})/.test(
    searchable,
  )
) {
  fail("Potential credential detected in Skill files.");
}

process.stdout.write(
  `Validated beatapi-video Skill (${markdown.split("\n").length} SKILL.md lines, ${evals.evals.length} evals).\n`,
);
