import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const packagedExecutable = join(root, "release", "win-unpacked", "OpenBuddy.exe");

function run(command, arguments_, environment = process.env) {
  const result = spawnSync(command, arguments_, {
    cwd: root,
    env: environment,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(pnpmCommand, ["exec", "moon", "run", "openbuddy:electron.build.win"]);

if (process.platform !== "win32" || !existsSync(packagedExecutable)) {
  throw new Error(`Packaged Windows executable was not found: ${packagedExecutable}`);
}

console.log(`[windows-runtime] validating packaged executable: ${packagedExecutable}`);
run(pnpmCommand, ["run", "test:electron:real-ui"], {
  ...process.env,
  OPENBUDDY_ELECTRON_PATH: packagedExecutable,
});
