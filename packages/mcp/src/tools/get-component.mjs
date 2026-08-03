/**
 * get_component — 원장 행 + docs-content + 사이즈 통합 상세 (08-mcp §4.2).
 * v2 get_component_props + get_bundle_info의 통합 후계. 진행 상태가 1급 응답이다.
 * 콘텐츠 정본은 루트 docs-content/(DEC-021·DEC-026) — controls·tokensUsed·a11y 표 포함.
 */
import { contentFor, findRow, meta, snippetPlatforms, suggest } from "./common.mjs";

export function getComponent(data, input) {
  const row = findRow(data, input.id);
  if (!row) {
    return {
      ok: false,
      ...meta(data),
      error: `component "${input.id}" not found in ledger`,
      suggestions: suggest(data, input.id),
    };
  }
  const c = contentFor(data, row) ?? {};
  // size-baseline은 CE 디렉토리명(kebab) 키 — ledger id와 다를 수 있어(Input↔text-field)
  // web 스니펫에서 파생한 tag(jd-*)로 해소한다.
  const sizeKey = c.tag ? c.tag.replace(/^jd-/, "") : null;
  const gzipBytes = sizeKey ? data.sizeBaseline?.components?.[sizeKey] ?? null : null;

  return {
    ok: true,
    ...meta(data),
    id: row.id,
    category: row.category,
    tier: row.tier,
    status: {
      web: row.web,
      ios: row.ios,
      docs: row.docs,
      tests: row.tests,
      bench: row.bench,
    },
    notes: row.notes ?? null,
    tag: c.tag ?? null,
    title: c.title ?? null,
    desc: c.oneLiner ?? null,
    tags: c.tags ?? null,
    controls: c.controls?.length ? c.controls : null,
    tokensUsed: c.tokens?.length ? c.tokens : null,
    a11y: c.a11y?.length ? c.a11y : null,
    snippetPlatforms: snippetPlatforms(c),
    gzipBytes,
  };
}
