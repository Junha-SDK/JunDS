/**
 * <jd-card> / <jd-card-header> / <jd-card-body> / <jd-card-footer> — 카드 컨테이너
 * 컴파운드 (v2 composites/Card). ledger 1행(Card)에 속하는 4태그 — Page 3태그 선례.
 *
 * v2가 React Compound Component(`Card.Header`)로 표현하던 것을 CE에서는 **태그**로 낸다.
 * 네 태그 모두 JdBox 파생이라 스타일 프롭(p·maxW·bg…)이 그대로 붙는다 — v2가
 * `className`으로 열어 두었던 탈출구의 바닐라 등가물이다.
 *
 * v2 실측 2건:
 *  1. **`noPadding`은 아무 일도 하지 않았다.** `!noPadding && "p-0"` 분기라 켜든 끄든
 *     루트 패딩은 0이었다(Tailwind `p-0` == 클래스 없음). 죽은 프롭을 CE 표면으로
 *     옮기지 않는다 — 루트는 언제나 패딩 0이고 여백은 Header/Body/Footer가 갖는다.
 *  2. **다크 대응이 없었다.** `bg-white/95`·footer `bg-gray-50/30` 리터럴이라 다크에서
 *     흰 카드가 그대로 남았다. v3는 --jd-color-card / --jd-color-background 혼합으로
 *     두 테마 모두 성립한다(외관은 라이트에서 v2와 동일).
 *
 * v2 `asChild`(Radix Slot)는 React 렌더 위임이라 CE에 등가물이 없다 — react 어댑터 몫
 * (DEC-014-3 `as` 폴리모피즘 선례).
 *
 * 접근성: v2는 `hoverable` 카드에 `cursor-pointer`만 주고 **포커스 표현이 전무했다** —
 * 마우스 사용자만 피드백을 받았다. v3는 :focus-within으로 같은 상승 효과를 주고,
 * 상승 이동은 prefers-reduced-motion에서 뺀다(CSS).
 */
import { JdBox } from "../box/element.js";
import cardStyles from "./card.css.js";

export class JdCard extends JdBox {
  static override tag = "jd-card";
  static override styles = cardStyles;
  static override props = {
    ...JdBox.props,
    /** 호버 시 그림자·상승 피드백. 클릭 가능한 카드용 (v2 동형) */
    hoverable: { type: Boolean, reflect: true },
  };

  declare hoverable: boolean;
}

export class JdCardHeader extends JdBox {
  static override tag = "jd-card-header";
  static override styles = cardStyles;

  protected override render(): void {
    super.render();
    this.#promoteTitle();
  }

  /**
   * v2 `typeof children === "string"`이면 <h3>로 감싸던 규칙의 이식.
   * 텍스트만 있을 때만 승격한다 — 요소가 섞여 있으면 소비자 레이아웃을 건드리지 않는다.
   * 입양(§3.3): 이미 승격된 제목이 있으면(SSR·재렌더) 다시 만들지 않는다.
   */
  #promoteTitle(): void {
    if (this.querySelector(":scope > .jd-card-header__title")) return;
    const nodes = [...this.childNodes];
    if (nodes.some((n) => n instanceof Element)) return;
    if (!(this.textContent ?? "").trim()) return;
    const h3 = document.createElement("h3");
    h3.className = "jd-card-header__title";
    h3.append(...nodes);
    this.append(h3);
  }
}

export class JdCardBody extends JdBox {
  static override tag = "jd-card-body";
  static override styles = cardStyles;
}

export class JdCardFooter extends JdBox {
  static override tag = "jd-card-footer";
  static override styles = cardStyles;
}
