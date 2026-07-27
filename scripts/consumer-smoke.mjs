/**
 * 배포 tarball 깨끗한 소비 앱 E2E.
 *
 * workspace 링크나 저장소 소스를 보지 않는 임시 프로젝트에 실제 npm tarball을
 * 설치하고 Vanilla Vite, React 18/19 Vite, Next App Router production build를
 * 검증한다. 패키징 누락·exports/types·RSC "use client" 경계를 한 번에 잡는다.
 *
 * 사용:
 *   npm run consumer:smoke
 *   node scripts/consumer-smoke.mjs --react=19
 */
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const requested = process.argv
  .find((arg) => arg.startsWith("--react="))
  ?.slice("--react=".length);
const reactMajors = (requested ?? "18,19")
  .split(",")
  .map((value) => value.trim())
  .filter((value) => value === "18" || value === "19");
if (reactMajors.length === 0) {
  throw new Error("--react는 18, 19 또는 18,19여야 합니다.");
}

const workspace = mkdtempSync(join(tmpdir(), "junds-consumer-"));
const artifacts = join(workspace, "artifacts");
mkdirSync(artifacts);

function run(command, args, cwd, env = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(
      `${command} ${args.join(" ")} 실패 (${cwd})\n${detail.slice(-12_000)}`,
    );
  }
  return result.stdout.trim();
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.trimStart());
}

function packageVersion(name) {
  const path = join(root, "node_modules", name, "package.json");
  return run(
    process.execPath,
    [
      "-e",
      `process.stdout.write(require(${JSON.stringify(path)}).version)`,
    ],
    root,
  );
}

function installAndBuild(name, files, dependencies, command = ["run", "build"]) {
  const cwd = join(workspace, name);
  mkdirSync(cwd);
  write(
    join(cwd, "package.json"),
    JSON.stringify(
      {
        name: `junds-consumer-${name}`,
        private: true,
        type: "module",
        scripts: { build: files.buildScript },
        dependencies,
      },
      null,
      2,
    ) + "\n",
  );
  for (const [path, content] of Object.entries(files.sources)) {
    write(join(cwd, path), content);
  }
  run(
    npm,
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      "--legacy-peer-deps",
      "--prefer-offline",
    ],
    cwd,
  );
  run(npm, command, cwd, { NEXT_TELEMETRY_DISABLED: "1" });
  console.log(`[consumer] PASS ${name}`);
}

let keepWorkspace = false;
try {
  const webTarName = basename(
    run(
      npm,
      [
        "pack",
        "--silent",
        "--pack-destination",
        artifacts,
        join(root, "packages/web"),
      ],
      root,
    ).split("\n").at(-1),
  );
  const reactTarName = basename(
    run(
      npm,
      [
        "pack",
        "--silent",
        "--pack-destination",
        artifacts,
        join(root, "packages/react"),
      ],
      root,
    ).split("\n").at(-1),
  );
  const webTar = `file:${join(artifacts, webTarName)}`;
  const reactTar = `file:${join(artifacts, reactTarName)}`;
  const vite = packageVersion("vite");
  const typescript = packageVersion("typescript");
  const next = packageVersion("next");
  const nodeTypes = packageVersion("@types/node");

  installAndBuild(
    "vanilla-vite",
    {
      buildScript: "tsc --noEmit && vite build",
      sources: {
        "index.html": '<div id="app"></div><script type="module" src="/src/main.ts"></script>',
        "tsconfig.json": JSON.stringify({
          compilerOptions: {
            target: "ES2022",
            module: "ESNext",
            moduleResolution: "Bundler",
            lib: ["ES2022", "DOM"],
            strict: true,
            noEmit: true,
          },
          include: ["src"],
        }),
        "src/main.ts": `
          import "@junds/web/core.css";
          import "@junds/web/css/button.css";
          import "@junds/web/button";
          import type { JdButton } from "@junds/web/button/element";

          const button = document.createElement("jd-button") as JdButton;
          button.variant = "outline";
          button.textContent = "Vanilla 소비 앱";
          document.querySelector("#app")!.append(button);
        `,
      },
    },
    {
      "@junds/web": webTar,
      typescript,
      vite,
    },
  );

  for (const major of reactMajors) {
    installAndBuild(
      `react-${major}-vite`,
      {
        buildScript: "tsc --noEmit && vite build",
        sources: {
          "index.html": '<div id="root"></div><script type="module" src="/src/main.tsx"></script>',
          "tsconfig.json": JSON.stringify({
            compilerOptions: {
              target: "ES2022",
              module: "ESNext",
              moduleResolution: "Bundler",
              lib: ["ES2022", "DOM", "DOM.Iterable"],
              jsx: "react-jsx",
              strict: true,
              noEmit: true,
              skipLibCheck: true,
            },
            include: ["src"],
          }),
          "src/main.tsx": `
            import { StrictMode } from "react";
            import { createRoot } from "react-dom/client";
            import { Button } from "@junds/react/button";
            import "@junds/web/core.css";
            import "@junds/web/css/button.css";

            createRoot(document.querySelector("#root")!).render(
              <StrictMode>
                <Button variant="outline" onClick={() => undefined}>
                  React ${major} 소비 앱
                </Button>
              </StrictMode>,
            );
          `,
        },
      },
      {
        "@junds/web": webTar,
        "@junds/react": reactTar,
        react: major,
        "react-dom": major,
        "@types/react": major,
        "@types/react-dom": major,
        typescript,
        vite,
      },
    );
  }

  // App Router는 현재 Next가 요구하는 React 19로 한 번만 검증한다.
  if (reactMajors.includes("19")) {
    installAndBuild(
      "next-app-router",
      {
        buildScript: "next build",
        sources: {
          "tsconfig.json": JSON.stringify({
            compilerOptions: {
              target: "ES2017",
              lib: ["dom", "dom.iterable", "esnext"],
              strict: true,
              noEmit: true,
              module: "esnext",
              moduleResolution: "bundler",
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: "react-jsx",
              skipLibCheck: true,
            },
            include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            exclude: ["node_modules"],
          }),
          "app/layout.tsx": `
            import "@junds/web/core.css";
            import "@junds/web/css/button.css";

            export default function Layout({ children }: { children: React.ReactNode }) {
              return <html lang="ko"><body>{children}</body></html>;
            }
          `,
          "app/page.tsx": `
            import ClientDemo from "./client-demo";

            export default function Page() {
              return <main><h1>JunDS SSR</h1><ClientDemo /></main>;
            }
          `,
          "app/client-demo.tsx": `
            "use client";
            import { Button } from "@junds/react/button";

            export default function ClientDemo() {
              return <Button variant="primary">Next App Router</Button>;
            }
          `,
        },
      },
      {
        "@junds/web": webTar,
        "@junds/react": reactTar,
        next,
        react: "19",
        "react-dom": "19",
        "@types/react": "19",
        "@types/react-dom": "19",
        "@types/node": nodeTypes,
        typescript,
      },
    );
  }

  console.log(
    `[consumer] PASS — Vanilla Vite · React ${reactMajors.join("/")} Vite` +
      `${reactMajors.includes("19") ? " · Next App Router" : ""}`,
  );
} catch (error) {
  keepWorkspace = true;
  console.error(`[consumer] 임시 작업공간 보존: ${workspace}`);
  throw error;
} finally {
  if (!keepWorkspace) rmSync(workspace, { recursive: true, force: true });
}
