/**
 * JunDS v3 공개 API 기준선.
 *
 * npm exports, React peer 범위, Web→React 생성 표면(props/defaults/events), 그리고
 * 실제 배포되는 .d.ts 파일 해시를 함께 고정한다. 변경은 `npm run api:update`로
 * 명시적으로 승인하며, 평소 CI는 `npm run api:check`로 드리프트를 막는다.
 *
 * 전제: @junds/web / @junds/react build 완료.
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = join(
  root,
  "docs-spec/registry/public-api-baseline.json",
);
const update = process.argv.includes("--update-baseline");

function json(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function declarationHashes(packageDir) {
  const typesDir = join(packageDir, "dist/types");
  if (!existsSync(typesDir)) {
    throw new Error(
      `${relative(root, typesDir)} 없음 — 패키지를 먼저 build 하세요.`,
    );
  }
  const out = {};
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(path);
        continue;
      }
      if (!entry.name.endsWith(".d.ts")) continue;
      const key = relative(typesDir, path).replaceAll("\\", "/");
      const normalized = readFileSync(path, "utf8")
        .replaceAll("\r\n", "\n")
        .trimEnd();
      out[key] = createHash("sha256").update(normalized).digest("hex");
    }
  };
  visit(typesDir);
  return Object.fromEntries(
    Object.entries(out).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function canonicalExports(exportsMap) {
  return Object.fromEntries(
    Object.entries(exportsMap).sort(([a], [b]) => a.localeCompare(b)),
  );
}

const webDir = join(root, "packages/web");
const reactDir = join(root, "packages/react");
const webPackage = json(join(webDir, "package.json"));
const reactPackage = json(join(reactDir, "package.json"));
const adapters = json(join(reactDir, "scripts/adapters.generated.json"));

const current = {
  schemaVersion: 1,
  web: {
    exports: canonicalExports(webPackage.exports),
    declarations: declarationHashes(webDir),
  },
  react: {
    peerDependencies: reactPackage.peerDependencies,
    exports: canonicalExports(reactPackage.exports),
    generatedSurface: adapters,
    declarations: declarationHashes(reactDir),
  },
};

const serialized = JSON.stringify(current, null, 2) + "\n";
if (update || !existsSync(baselinePath)) {
  writeFileSync(baselinePath, serialized);
  console.log(
    `[api] 기준선 ${update ? "갱신" : "생성"} — ` +
      `Web ${Object.keys(current.web.exports).length} exports / ` +
      `React ${Object.keys(current.react.exports).length} exports`,
  );
  process.exit(0);
}

const baseline = readFileSync(baselinePath, "utf8");
if (baseline === serialized) {
  console.log(
    `[api] PASS — Web ${Object.keys(current.web.exports).length} exports · ` +
      `React ${Object.keys(current.react.exports).length} exports · ` +
      `생성 어댑터 ${adapters.length}종`,
  );
  process.exit(0);
}

function changedKeys(before, after) {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  return [...keys]
    .filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]))
    .sort();
}

const previous = JSON.parse(baseline);
const changes = {
  webExports: changedKeys(previous.web?.exports, current.web.exports),
  webDeclarations: changedKeys(
    previous.web?.declarations,
    current.web.declarations,
  ),
  reactExports: changedKeys(previous.react?.exports, current.react.exports),
  reactDeclarations: changedKeys(
    previous.react?.declarations,
    current.react.declarations,
  ),
  generatedSurface:
    JSON.stringify(previous.react?.generatedSurface) ===
    JSON.stringify(current.react.generatedSurface)
      ? []
      : ["adapters.generated.json"],
  peerDependencies:
    JSON.stringify(previous.react?.peerDependencies) ===
    JSON.stringify(current.react.peerDependencies)
      ? []
      : ["peerDependencies"],
};

console.error("[api] FAIL — 공개 API 기준선과 현재 산출물이 다릅니다.");
for (const [kind, files] of Object.entries(changes)) {
  if (files.length === 0) continue;
  const shown = files.slice(0, 12);
  console.error(
    `  ${kind}: ${shown.join(", ")}${files.length > shown.length ? ` 외 ${files.length - shown.length}건` : ""}`,
  );
}
console.error("의도한 변경이면 `npm run api:update`로 기준선을 함께 갱신하세요.");
process.exit(1);
