#!/usr/bin/env node

import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const subcommand = args[0];

if (!subcommand || (subcommand !== "dev" && subcommand !== "start")) {
  console.error("Usage: run-server.mjs <dev|start> [--port <n>] [--max-attempts <n>]");
  process.exit(1);
}

const flagIndex = (name) => args.indexOf(name);
const readFlag = (name, fallback) => {
  const i = flagIndex(name);
  if (i === -1) return fallback;
  const v = args[i + 1];
  return v === undefined ? fallback : v;
};

const desiredPort = Number(readFlag("--port", process.env.PORT ?? 6100));
const maxAttempts = Number(readFlag("--max-attempts", 20));
const host = process.env.HOST ?? "0.0.0.0";

if (!Number.isFinite(desiredPort) || desiredPort < 0 || desiredPort > 65535) {
  console.error(`[run-server] invalid port: ${desiredPort}`);
  process.exit(1);
}

const isPortFree = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE" || err.code === "EACCES") resolve(false);
      else resolve(false);
    });
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });

const findOpenPort = async (start, attempts) => {
  for (let i = 0; i < attempts; i++) {
    const port = start + i;
    if (port > 65535) break;
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port)) return { port, shifted: i > 0 };
  }
  return null;
};

const result = await findOpenPort(desiredPort, maxAttempts);

if (!result) {
  console.error(
    `[run-server] no free port in range ${desiredPort}–${desiredPort + maxAttempts - 1}`,
  );
  process.exit(1);
}

const { port, shifted } = result;

const url = `http://localhost:${port}`;
const bar = "─".repeat(40);
console.log(`\u001b[36m${bar}\u001b[0m`);
if (shifted) {
  console.log(
    `\u001b[33m  port ${desiredPort} busy → falling back to ${port}\u001b[0m`,
  );
}
console.log(`\u001b[1m  ▶ ${url}\u001b[0m`);
console.log(`\u001b[36m${bar}\u001b[0m`);

const passthrough = args.filter((_, i) => {
  const idx = i;
  if (idx === 0) return false;
  const prev = args[idx - 1];
  if (args[idx] === "--port" || args[idx] === "--max-attempts") return false;
  if (prev === "--port" || prev === "--max-attempts") return false;
  return true;
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nextBin = path.resolve(__dirname, "../node_modules/next/dist/bin/next");

const child = spawn(
  process.execPath,
  [nextBin, subcommand, "-p", String(port), ...passthrough],
  { stdio: "inherit", env: { ...process.env, PORT: String(port) } },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});

const forward = (sig) => process.on(sig, () => child.kill(sig));
forward("SIGINT");
forward("SIGTERM");
