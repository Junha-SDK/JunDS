/**
 * get_tokens — 토큰 조회 (08-mcp §4.4).
 * 항목: { group, path, cssVar, value, swift } — 파생 이름은 데이터 로더가
 * 생성기 함수로 계산(스냅샷에는 계산 결과가 동봉). 무인자 호출은 그룹 요약만
 * (전체 덤프 방지).
 */
import { meta } from "./common.mjs";

const LIMIT = 100;

export function getTokens(data, input = {}) {
  const { group, name } = input;

  if (!group && !name) {
    const counts = {};
    for (const t of data.tokens) counts[t.group] = (counts[t.group] ?? 0) + 1;
    return {
      ok: true,
      ...meta(data),
      groups: Object.entries(counts).map(([g, count]) => ({ group: g, count })),
      note: "group 또는 name으로 조회한다 — 전체 덤프는 제공하지 않는다.",
    };
  }

  let entries = data.tokens;
  if (group) entries = entries.filter((t) => t.group === group);
  if (name) {
    const q = String(name).toLowerCase();
    // 정확 일치(cssVar/path/swift) 우선, 없으면 부분 일치로 완화.
    const exact = entries.filter((t) => t.cssVar === name || t.path === name || t.swift === name);
    entries = exact.length
      ? exact
      : entries.filter(
          (t) =>
            (t.cssVar ?? "").toLowerCase().includes(q) ||
            t.path.toLowerCase().includes(q) ||
            (t.swift ?? "").toLowerCase().includes(q),
        );
  }

  const total = entries.length;
  return {
    ok: true,
    ...meta(data),
    total,
    truncated: total > LIMIT,
    tokens: entries.slice(0, LIMIT),
  };
}
