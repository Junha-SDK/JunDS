/**
 * search_components — 원장+docs-content 개념 검색 (08-mcp §4.1).
 * v2 locate(개념 검색)·list_hooks(category=hooks)의 소비자 관점 후계.
 */
import { contentFor, fold, meta, normStatus } from "./common.mjs";

const LIMIT = 50;

/** 다중 텀 AND — 각 텀은 어느 필드든 1곳 이상 매칭해야 한다. 랭킹은 합산. */
function scoreRow(row, content, terms) {
  let score = 0;
  for (const term of terms) {
    const tf = fold(term);
    const idf = fold(row.id);
    const tags = content.tags ?? [];
    let s = 0;
    if (idf === tf) s = 100;
    else if (idf.startsWith(tf)) s = 80;
    else if (tags.some((t) => t.toLowerCase() === term)) s = 60;
    else if (idf.includes(tf)) s = 50;
    else if (tags.some((t) => t.toLowerCase().includes(term))) s = 30;
    else if ((content.oneLiner ?? "").toLowerCase().includes(term)) s = 20;
    else if (
      (row.notes ?? "").toLowerCase().includes(term) ||
      fold(content.tag ?? "").includes(tf)
    ) s = 10;
    if (s === 0) return 0; // AND 실패
    score += s;
  }
  return score;
}

export function searchComponents(data, input = {}) {
  const { query, category, platform, status } = input;
  let rows = data.ledger.rows;

  if (category) rows = rows.filter((r) => r.category === category);
  if (platform) {
    // platform 단독 = "그 플랫폼에서 지금 쓸 수 있는 것"(done). status 병기 시 그 상태로.
    const want = status ?? "done";
    rows = rows.filter((r) => normStatus(r[platform]) === want);
  } else if (status) {
    rows = rows.filter(
      (r) => normStatus(r.web) === status || normStatus(r.ios) === status,
    );
  }

  const terms = query
    ? String(query).toLowerCase().split(/\s+/).filter(Boolean)
    : null;

  let scored = rows.map((r) => {
    const c = contentFor(data, r) ?? {};
    return { r, c, score: terms ? scoreRow(r, c, terms) : 0 };
  });
  if (terms) {
    scored = scored.filter((x) => x.score > 0);
    scored.sort((a, b) => b.score - a.score); // 안정 정렬 — 동점은 원장 순
  }

  const total = scored.length;
  const results = scored.slice(0, LIMIT).map(({ r, c }) => ({
    id: r.id,
    category: r.category,
    tier: r.tier,
    web: r.web,
    ios: r.ios,
    ...(c.tag ? { tag: c.tag } : {}),
    ...(c.oneLiner ? { desc: c.oneLiner } : {}),
    ...(c.tags?.length ? { tags: c.tags } : {}),
  }));

  return {
    ok: true,
    ...meta(data),
    total,
    truncated: total > LIMIT, // 조용한 절단 금지(08-mcp §4.1)
    results,
  };
}
