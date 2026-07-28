/**
 * CSS 텍스트 단언 헬퍼.
 *
 * ## 왜 필요한가
 * `css` 태그의 `text`를 **공백까지 정확히** 비교하던 단언들이 있었다. 그런데 CSS에서
 * 공백은 계약이 아니다 — 계약은 어떤 선택자에 어떤 선언이 붙느냐다. 포매터를 들이자
 * 그 단언들이 한꺼번에 깨졌는데, 깨진 이유가 "동작이 바뀌어서"가 아니라
 * "들여쓰기가 바뀌어서"였다. 그런 테스트는 리팩터링을 막기만 하고 결함은 못 잡는다.
 *
 * 그래서 비교 전에 공백을 접는다. 선언이 사라지거나 값이 바뀌면 여전히 실패한다.
 */

/**
 * 연속 공백을 하나로 접고 양끝을 다듬는다.
 *
 * 토큰 사이 구분자를 없애지는 않는다 — `a{b}`와 `a { b }`를 같게 만들면 선택자가
 * 붙어 버린 진짜 오류까지 통과시킨다. 접는 것은 **양**이지 유무가 아니다.
 */
export function squish(css: string): string {
  return css.replace(/\s+/g, " ").trim();
}

/** 공백 무관 포함 검사 — 단언 양쪽을 같은 규칙으로 접는다 */
export function cssContains(haystack: string, needle: string): boolean {
  return squish(haystack).includes(squish(needle));
}
