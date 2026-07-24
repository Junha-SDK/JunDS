/**
 * <jd-gradient-border> — 그라디언트 테두리 래퍼 (v2 composites/GradientBorder).
 *
 * 골격은 래퍼 1개다: 호스트가 그라디언트 배경 + 테두리 두께만큼의 패딩을 갖고,
 * 안쪽 표면(.jd-gradient-border__inner)이 카드 배경으로 그것을 덮는다.
 * v2는 여기에 `absolute inset-0` 그라디언트 레이어 div를 하나 더 뒀는데, 호스트 배경으로
 * 같은 그림이 나오므로 DOM 하나를 줄였다(애니메이션 대상도 그대로 배경이다).
 *
 * v2 대비 판단·개선 3가지:
 *  1. **`gradient`는 Tailwind 클래스 문자열을 받지 않는다.** v2 기본값
 *     `"from-primary via-accent to-primary"`는 Tailwind 어휘라 바닐라에 등가물이 없다
 *     (§4.3 "클래스 문자열 기계 변환 금지"). v3는 (a) 토큰 이름(`sunset`·`ocean`… →
 *     `--jd-gradient-*`) 또는 (b) 완성된 CSS 그라디언트 원문을 받고, 그 외에는 기본값
 *     (primary→accent→primary 90deg = v2 기본과 같은 그림)으로 떨어진다.
 *  2. **`rounded`(Tailwind 클래스) → `radius`(토큰 이름)**. 기본 `xl`(12px)은 v2
 *     `rounded-xl`과 같은 값이다. 안쪽 표면은 `border-radius: inherit` — v2처럼 바깥과
 *     같은 반경을 쓴다.
 *  3. **키프레임이 인스턴스마다 주입되지 않는다.** v2는 `animated`일 때 컴포넌트가
 *     `<style>` 태그를 렌더해 같은 @keyframes를 카드 수만큼 문서에 꽂았다. v3는 컴포넌트
 *     시트에 1회. 더불어 prefers-reduced-motion에서는 애니메이션을 멈춘다(v2에는 없던 가드).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import gradientBorderStyles from "./gradient-border.css.js";

/** `--jd-gradient-<name>` 로 안전하게 이어붙일 수 있는 토큰 이름만 통과 */
const GRADIENT_TOKEN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class JdGradientBorder extends JdElement {
  static override tag = "jd-gradient-border";
  static override props = {
    /** 토큰 이름(`sunset`·`ocean`…) 또는 CSS 그라디언트 원문. 빈 값이면 기본 그라디언트 */
    gradient: { type: String },
    /** 테두리 두께(px). v2 기본 2 */
    borderWidth: { type: Number, default: 2 },
    /** none | sm | md | lg | xl | 2xl | full — v2 rounded-xl == xl(12px) */
    radius: { type: String, default: "xl", reflect: true },
    animated: { type: Boolean, reflect: true },
  };

  declare gradient: string;
  declare borderWidth: number;
  declare radius: string;
  declare animated: boolean;

  protected render(): void {
    adoptStyles(gradientBorderStyles);
    // 입양 규칙(§3.3)
    let inner = this.querySelector<HTMLDivElement>(":scope > .jd-gradient-border__inner");
    if (!inner) {
      inner = document.createElement("div");
      inner.className = "jd-gradient-border__inner";
      inner.append(...this.childNodes);
      this.append(inner);
    }
    this.update();
  }

  protected override update(): void {
    const bw = this.borderWidth >= 0 ? this.borderWidth : 2;
    this.style.setProperty("--jd-gradient-border-width", `${bw}px`);
    const image = this.#resolveGradient();
    if (image) this.style.setProperty("--jd-gradient-border-image", image);
    else this.style.removeProperty("--jd-gradient-border-image");
  }

  /** 토큰 이름 → var(--jd-gradient-*), CSS 원문 → 그대로, 그 외 → null(기본값 사용) */
  #resolveGradient(): string | null {
    const raw = this.gradient.trim();
    if (!raw) return null;
    if (raw.includes("(")) return raw;
    if (!GRADIENT_TOKEN.test(raw)) return null;
    return `var(--jd-gradient-${raw}, var(--jd-gradient-border-default))`;
  }
}
