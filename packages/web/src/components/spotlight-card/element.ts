/**
 * <jd-spotlight-card> — 포인터를 따라오는 스포트라이트 글로우 카드 (v2 composites/SpotlightCard).
 *
 * 표면은 JdBox 파생이라 스타일 프롭(p·radius·maxW…)이 그대로 붙는다. 글로우는 **DOM 0**:
 * 호스트 ::before + 커스텀 프로퍼티 2개(x/y)만 갱신한다(jd-badge의 dot ::before 선례).
 * `isolation: isolate`로 호스트가 쌓임 문맥을 만들고 ::before는 z-index:-1 —
 * 호스트 배경 위, 콘텐츠 아래에 정확히 들어간다(v2의 z-0 오버레이 + z-10 래퍼와 동형,
 * 래퍼 div 2개가 사라진다).
 *
 * v2 대비 개선 3가지:
 *  1. **포인터 이동마다 리렌더하지 않는다.** v2는 setState로 좌표를 들고 있어 마우스가
 *     움직일 때마다 컴포넌트 트리가 다시 렌더되고 거대한 gradient 문자열이 매번 새로
 *     조립됐다. v3는 --jd-spotlight-card-x/y 두 값만 쓴다.
 *  2. **페이드가 실제로 동작한다.** v2는 `transition-opacity`를 단 요소를 조건부 렌더로
 *     붙였다 뗐다 해서(마운트/언마운트) 전이가 한 번도 실행되지 않았다. v3는 요소가
 *     늘 있고 opacity만 오간다 — 나갈 때도 부드럽게 사라진다.
 *  3. **pointer 이벤트**라 펜·터치도 동작한다(v2는 mousemove 전용).
 *
 * 프리렌더 결정성(§3.1-3): render()는 측정하지 않는다. 최초 좌표는 50%/50%이고
 * 첫 실측은 connected() 이후 포인터가 들어올 때다.
 */
import { JdBox } from "../box/element.js";
import { on, createHoverWatcher } from "../../behaviors/input.js";
import spotlightCardStyles from "./spotlight-card.css.js";

export class JdSpotlightCard extends JdBox {
  static override tag = "jd-spotlight-card";
  static override styles = spotlightCardStyles;
  static override props = {
    ...JdBox.props,
    /** 글로우 색. 빈 값이면 CSS 기본(primary 8%) — v2 기본값과 동색 */
    spotlightColor: { type: String },
    /** 글로우 반경(px). v2 기본 300 */
    spotlightSize: { type: Number, default: 300 },
  };

  declare spotlightColor: string;
  declare spotlightSize: number;

  #live = false;
  #off: (() => void) | null = null;

  protected override connected(): void {
    this.#live = true;
    this.#off = on(this, "pointermove", this.#onMove as (e: never) => void);
    this.own(
      createHoverWatcher(this, (hovered) => {
        this.toggleAttribute("data-hovered", hovered);
      }),
    );
  }

  protected override disconnected(): void {
    this.#live = false;
    this.#off?.();
    this.#off = null;
    this.removeAttribute("data-hovered");
  }

  protected override update(): void {
    super.update(); // 스타일 프롭
    const color = this.spotlightColor.trim();
    if (color) this.style.setProperty("--jd-spotlight-card-color", color);
    else this.style.removeProperty("--jd-spotlight-card-color");
    const size = this.spotlightSize > 0 ? this.spotlightSize : 300;
    this.style.setProperty("--jd-spotlight-card-size", `${size}px`);
  }

  /** 측정은 연결 이후에만 — render 단계에서 레이아웃을 읽지 않는다(§3.1-3) */
  #onMove = (e: PointerEvent): void => {
    if (!this.#live) return;
    const rect = this.getBoundingClientRect();
    this.style.setProperty("--jd-spotlight-card-x", `${e.clientX - rect.left}px`);
    this.style.setProperty("--jd-spotlight-card-y", `${e.clientY - rect.top}px`);
  };
}
