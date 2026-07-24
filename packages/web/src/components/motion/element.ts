/**
 * <jd-motion> — 진입 모션 래퍼 8프리셋 (v2 primitives/Motion).
 *
 * - 감속 대응이 **전부 CSS**다: v2는 useReducedMotion(matchMedia)을 읽어 클래스를
 *   붙일지 결정했는데, 그건 프리렌더 산출물이 실행 환경에 따라 달라진다는 뜻이다
 *   (§3.1-3 위반 소지). v3는 @media (prefers-reduced-motion)로 애니메이션만 끈다 —
 *   JS 0줄, 초기 HTML 동일. v2 `respectReducedMotion={false}` 옵트아웃은
 *   `force-motion` attribute가 대신한다.
 * - v2 `once` 프롭은 선언만 되고 본문에서 쓰이지 않는 죽은 표면이라 승계하지 않는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import motionStyles from "./motion.css.js";

export class JdMotion extends JdElement {
  static override tag = "jd-motion";
  static override props = {
    /** fade | fade-up | fade-down | scale | slide-up | slide-down | slide-left | slide-right */
    preset: { type: String, default: "fade", reflect: true },
    /** 진입 지연(ms) */
    delay: { type: Number, default: 0 },
    /** 감속 선호를 무시하고 재생 */
    forceMotion: { type: Boolean, reflect: true },
  };

  declare preset: string;
  declare delay: number;
  declare forceMotion: boolean;

  protected render(): void {
    adoptStyles(motionStyles);
    this.update();
  }

  protected override update(): void {
    if (this.delay) this.style.setProperty("animation-delay", `${this.delay}ms`);
    else this.style.removeProperty("animation-delay");
  }
}
