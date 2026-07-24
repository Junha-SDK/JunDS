import { css } from "../../core/styles.js";

/**
 * jd-masonry-grid CSS — v2 patterns/MasonryGrid 토큰 번역.
 *
 * v2는 CSS `columns` 다단(multicol) + 자식 `break-inside-avoid`로 핀터레스트형
 * 메이슨리를 만든다. 반응형 컬럼 사다리는 Tailwind 브레이크포인트(sm=640 · lg=1024 ·
 * xl=1280, --jd-breakpoint-* 와 동값)를 그대로 승계한다:
 *   columns 2 → columns-1 sm:2          → base 1 · sm 2
 *   columns 3 → columns-1 sm:2 lg:3      → base 1 · sm 2 · lg 3   (기본값)
 *   columns 4 → columns-1 sm:2 lg:3 xl:4 → base 1 · sm 2 · lg 3 · xl 4
 *
 * gap(px, 기본 16)은 v2에서 컨테이너 column-gap과 각 아이템 margin-bottom **양쪽**에
 * 같은 값으로 쓰였다. 여기서는 element.update()가 --jd-masonry-gap 인라인 변수를 세우고
 * CSS가 가로(column-gap)·세로(margin-block-end) 두 축에서 그 변수를 소비한다. multicol은
 * row-gap을 무시하므로 세로 간격은 반드시 자식 margin이어야 한다(v2 동형).
 *
 * columns 기본값 3은 attribute로 반영되지 않으므로(§1.3) base + `:not([columns="2"])`
 * 규칙이 담당한다. 미디어 쿼리는 var()를 받지 못하므로 브레이크포인트만 리터럴이다.
 *
 * 구조 개선(§ v2 대비): v2는 자식마다 wrapper <div>를 끼웠지만, light DOM에서는
 * 자식을 직접 `> *`로 스타일한다 — DOM 래핑 0, 사용자 마크업·폼 참여 보존, 입양 안정.
 */
export default css`
@layer junds.base {
  jd-masonry-grid:not(:defined) { display: block; }
}
@layer junds.components {
  /* 기본 = columns 3 · base 1컬럼 */
  jd-masonry-grid {
    display: block;
    column-count: 1;
    column-gap: var(--jd-masonry-gap, var(--jd-space-4));
  }
  jd-masonry-grid > * {
    break-inside: avoid;
    margin-block-end: var(--jd-masonry-gap, var(--jd-space-4));
  }

  /* sm(640)+ : 2·3·4 전부 최소 2컬럼 (bare가 모두 커버) */
  @media (min-width: 640px) {
    jd-masonry-grid { column-count: 2; }
  }
  /* lg(1024)+ : 기본(3)·3·4는 3컬럼 · 2는 2 유지 */
  @media (min-width: 1024px) {
    jd-masonry-grid:not([columns="2"]) { column-count: 3; }
  }
  /* xl(1280)+ : 4만 4컬럼 */
  @media (min-width: 1280px) {
    jd-masonry-grid[columns="4"] { column-count: 4; }
  }
}`;
