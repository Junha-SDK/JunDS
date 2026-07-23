/**
 * get_status — 원장 집계 대시보드 (08-mcp §4.5).
 * 06 문서 화면 지원 배지와 같은 원장을 읽으므로 수치가 항상 일치한다.
 */
import { meta, normStatus } from "./common.mjs";

function tally(rows, key) {
  const t = { done: 0, wip: 0, todo: 0, na: 0, other: 0 };
  for (const r of rows) t[normStatus(r[key])]++;
  return t;
}

export function getStatus(data, input = {}) {
  const rows = input.category
    ? data.ledger.rows.filter((r) => r.category === input.category)
    : data.ledger.rows;

  const grouped = {};
  for (const r of rows) (grouped[r.category] ??= []).push(r);

  const byCategory = {};
  for (const [cat, catRows] of Object.entries(grouped)) {
    byCategory[cat] = {
      total: catRows.length,
      web: tally(catRows, "web"),
      ios: tally(catRows, "ios"),
    };
  }

  return {
    ok: true,
    ...meta(data),
    total: rows.length,
    overall: { web: tally(rows, "web"), ios: tally(rows, "ios") },
    byCategory,
  };
}
