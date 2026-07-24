/**
 * <jd-masonry-grid> — 핀터레스트형 메이슨리 레이아웃 (v2 patterns/MasonryGrid).
 *
 * CSS 다단(multicol) + `break-inside: avoid`로 높이가 제각각인 아이템을 세로 흐름에
 * 채운다. 컬럼 수(columns)는 reflect되어 CSS가 반응형 사다리로 전부 처리한다(§4.3) —
 * 유일한 JS는 gap(px)을 --jd-masonry-gap 변수로 세우는 것뿐이다(가로 column-gap +
 * 세로 아이템 margin 양축을 한 변수로 구동).
 *
 * **standalone JdElement**(파생 아님): 이웃 jd-photo-grid[layout="masonry"]와 관용구가
 * 겹치지만, 그쪽 gap은 JdBox 토큰 gap(1|2|3|4 → 0.25~1rem)이고 컬럼 사다리도 base 2에서
 * 시작한다. 이 컴포넌트의 gap은 v2 그대로 **임의 px 정수**(base 16)이고 사다리는 base 1
 * → sm 2 → lg 3 → xl 4다 — 두 축이 정면으로 충돌하므로 파생하면 CSS를 거의 전부
 * 덮어써야 하고 원치 않는 프롭 표면(p·maxW·토큰 gap)까지 물려받는다. 파생이 손해.
 *
 * **구조 개선**: v2는 자식마다 wrapper <div>를 삽입했으나, light DOM에서는 자식을
 * 직접 스타일해 DOM 래핑을 없앴다(입양·SSR·폼 참여에 유리). 다단은 소스 순서를
 * 그대로 유지하므로 스크린리더 읽기 순서에 회귀가 없다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import masonryGridStyles from "./masonry-grid.css.js";

export class JdMasonryGrid extends JdElement {
  static override tag = "jd-masonry-grid";
  static override props = {
    /** 2 | 3 | 4 — 최대 컬럼 수. 기본 3(반영 안 되는 기본값이라 base 규칙이 담당, §1.3) */
    columns: { type: Number, default: 3, reflect: true },
    /** 아이템 간격(px). column-gap + 아이템 margin-block-end 양축에 적용. 기본 16 */
    gap: { type: Number, default: 16 },
  };

  declare columns: number;
  declare gap: number;

  protected render(): void {
    adoptStyles(masonryGridStyles);
    this.update();
  }

  protected override update(): void {
    this.style.setProperty("--jd-masonry-gap", `${this.gap}px`);
  }
}
