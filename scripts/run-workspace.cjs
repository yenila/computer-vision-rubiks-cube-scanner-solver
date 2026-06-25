const { spawnSync } = require("node:child_process");
const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");

const [workspace, script] = process.argv.slice(2);
if (!workspace || !script) {
  console.error("Usage: node scripts/run-workspace.cjs <workspace> <script>");
  process.exit(1);
}

const packageJsonPath = join(process.cwd(), workspace, "package.json");
if (!existsSync(packageJsonPath)) {
  console.error(`Workspace package.json not found: ${packageJsonPath}`);
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const command = packageJson.scripts?.[script];
if (!command) {
  console.error(`Script "${script}" not found in ${workspace}.`);
  process.exit(1);
}

const result = spawnSync(command, {
  cwd: join(process.cwd(), workspace),
  stdio: "inherit",
  shell: true
});

process.exit(result.status ?? 1);
