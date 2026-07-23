/**
 * jd-uid — 문서 단위 증분 id 발급 (03-web-arch §8).
 * light DOM의 aria-* id 참조용. `Math.random()` 금지(§3.1-3 결정적 렌더 규칙) —
 * 프리렌더 스냅샷 diff가 안정하도록 증분 카운터만 쓴다.
 */
let counter = 0;

export function jdUid(prefix = "jd"): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
