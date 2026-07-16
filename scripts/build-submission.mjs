import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const stagedSkill = resolve(dist, "beatapi-video");
const archive = resolve(dist, "beatapi-video-skill.zip");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(resolve(root, "skills/beatapi-video"), stagedSkill, {
  recursive: true,
});
execFileSync("zip", ["-X", "-q", "-r", archive, "beatapi-video"], {
  cwd: dist,
});
console.log(`Built Skill submission package: ${archive}`);
