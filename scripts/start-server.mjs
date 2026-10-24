import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const port = process.env.PORT || "10000";
const host = process.env.HOST || "0.0.0.0";

const wranglerBin = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));
const sitesEnv = fileURLToPath(new URL("./sites-env.mjs", import.meta.url));

const args = [
  "--import", sitesEnv,
  wranglerBin, "dev",
  "--config", "dist/server/wrangler.json",
  "--local",
  "--persist-to", ".wrangler/state",
  "--ip", host,
  "--port", String(port),
  "--inspector-port", "0"
];

console.log(`Starting PaperCommons on ${host}:${port}...`);
const child = spawn(process.execPath, args, { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
