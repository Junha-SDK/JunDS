/** 도구 공통 유틸 — id 접기·상태 정규화·미발견 제안·응답 메타. */

/** 대소문자 무시 + kebab↔Pascal 접기: "otp-input" ≡ "OTPInput" (08-mcp §4) */
export const fold = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[-_\s]/g, "");

/**
 * ledger 상태 문자열 정규화 — 자유 서술 변형("done(내부화)", "pass(1.2ms)",
 * "n/a") 전부 흡수. 필터·집계 전용이고, 응답에는 원문을 그대로 싣는다.
 */
export function normStatus(s) {
  const v = String(s ?? "")
    .trim()
    .toLowerCase();
  if (v.startsWith("done") || v.startsWith("pass")) return "done";
  if (v.startsWith("wip")) return "wip";
  if (v.startsWith("n/a") || v === "na" || v === "-") return "na";
  if (v.startsWith("todo")) return "todo";
  return "other";
}

/** fold 매칭으로 원장 행 찾기. */
export function findRow(data, id) {
  const f = fold(id);
  return data.ledger.rows.find((r) => fold(r.id) === f) ?? null;
}

/** 원장 행의 docs-content 엔트리 — 조인 키 (ledgerId, category) (DEC-021-2). */
export function contentFor(data, row) {
  return data.content[`${row.id}::${row.category}`] ?? null;
}

/** 저작된(비-null) 스니펫 플랫폼 목록. */
export function snippetPlatforms(entry) {
  return Object.entries(entry?.snippets ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k);
}

/** 미발견 시 부분일치·접두 3자 겹침 상위 n건 제안 (v2 available 힌트 계승). */
export function suggest(data, id, n = 5) {
  const f = fold(id);
  if (!f) return [];
  return data.ledger.rows
    .filter((r) => {
      const rf = fold(r.id);
      return (
        rf.includes(f) || f.includes(rf) || (f.length >= 3 && rf.slice(0, 3) === f.slice(0, 3))
      );
    })
    .slice(0, n)
    .map((r) => r.id);
}

/** 모든 응답 공통 메타 — AI가 데이터 신선도를 인지하게 한다(08-mcp §3.3). */
export function meta(data) {
  const m = { mode: data.mode, generatedAt: data.generatedAt };
  if (data.snapshotAt) m.snapshotAt = data.snapshotAt;
  return m;
}
