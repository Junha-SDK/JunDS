#!/usr/bin/env node
/**
 * audit-compound-api — `requirements/compound-api.md`가 요구하는 두 규약
 * (Compound members + asChild Slot 위임)을 어떤 컴포넌트가 따르는지 보고.
 *
 * 분석 대상:
 *   ds/composites/**\/<Name>.tsx
 *   ds/patterns/**\/<Name>.tsx
 *
 * 분류:
 *   ✓ migrated   — `createCompound(` 또는 `Object.assign(` 사용 + `asChild`
 *   ⚠ partial    — 멤버는 있지만 asChild 미지원 OR 그 반대
 *   • flat       — 멤버/asChild 모두 없음 (단일 컴포넌트, 정상일 수 있음)
 *   ✗ legacy     — `Object.assign(Root, { Member })` 사용 — 마이그레이션 대상
 *
 * 출력: .ai/compound-api.json + 콘솔 요약 + (--strict로 legacy>0 일 때 fail)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const REPORT_PATH = path.join(ROOT, ".ai", "compound-api.json");
const STRICT = process.argv.includes("--strict");

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile() && /\.tsx$/.test(entry.name) && !/\.stories\./.test(entry.name) && !/\.test\./.test(entry.name)) {
      yield p;
    }
  }
}

const items = [];
for (const dir of [path.join(ROOT, "ds", "composites"), path.join(ROOT, "ds", "patterns")]) {
  for (const file of walk(dir)) {
    const rel = path.relative(ROOT, file);
    const src = fs.readFileSync(file, "utf8");
    const usesCreateCompound = /\bcreateCompound\s*\(/.test(src);
    const usesObjectAssign = /Object\.assign\s*\(\s*[A-Z]\w+\s*,\s*\{/.test(src);
    const usesAsChild = /\basChild\b/.test(src);
    const usesSlot = /\b(?:Slot|Slottable)\b/.test(src);

    let status;
    if (usesCreateCompound && usesAsChild) status = "migrated";
    else if (usesObjectAssign) status = "legacy";
    else if (usesCreateCompound || usesAsChild) status = "partial";
    else status = "flat";

    items.push({ file: rel, status, usesCreateCompound, usesObjectAssign, usesAsChild, usesSlot });
  }
}

const summary = {
  migrated: items.filter((i) => i.status === "migrated").length,
  partial: items.filter((i) => i.status === "partial").length,
  flat: items.filter((i) => i.status === "flat").length,
  legacy: items.filter((i) => i.status === "legacy").length,
  total: items.length,
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), summary, items }, null, 2) + "\n");

console.log(`[audit-compound-api] ${summary.migrated} migrated · ${summary.partial} partial · ${summary.flat} flat · ${summary.legacy} legacy (총 ${summary.total})`);
if (summary.legacy > 0) {
  console.log("\n  legacy (Object.assign 사용 — createCompound로 교체 권장):");
  for (const it of items.filter((i) => i.status === "legacy").slice(0, 20)) {
    console.log("   ✗", it.file);
  }
  if (summary.legacy > 20) console.log(`   …외 ${summary.legacy - 20}개`);
}
if (summary.partial > 0) {
  console.log("\n  partial (멤버 또는 asChild 한쪽만 — 검토 권장):");
  for (const it of items.filter((i) => i.status === "partial").slice(0, 10)) {
    console.log("   ⚠", it.file, `(asChild=${it.usesAsChild}, createCompound=${it.usesCreateCompound})`);
  }
}

if (STRICT && summary.legacy > 0) process.exit(1);
