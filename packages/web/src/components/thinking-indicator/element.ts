/**
 * <jd-thinking-indicator> — AI/LLM 응답 대기 인디케이터 (v2 composites/ThinkingIndicator).
 * dots · pulse · wave · typewriter 4종.
 *
 * 판단 4건:
 * 1. **키프레임은 컴포넌트 시트로 올렸다.** v2는 컴포넌트 본문에 `<style>{keyframes}</style>`를
 *    넣어 **인스턴스마다 스타일 태그가 하나씩** 붙었다(채팅 목록이면 화면에 수십 개).
 *    v3는 adoptStyles가 문서당 1회 채택한다(§4.2) — DOM도 파싱도 1회다.
 * 2. **aria-label이 보이는 라벨을 덮어쓰고 있었다.** v2는 label이 있어도 host에
 *    `aria-label`을 걸어 화면 문구와 낭독 문구가 어긋났다. v3는 라벨을 그냥 텍스트로 두고
 *    (role=status·aria-live=polite가 변화를 알린다), 라벨이 없을 때만 숨김 문장으로 보충한다.
 * 3. **애니메이션 노드는 aria-hidden**. 점 3개는 낭독할 내용이 아니다.
 * 4. **reduced-motion 존중**(v2 없음): 움직임을 끄고 점만 남긴다 — 대기 중이라는 정보는
 *    role=status 문장이 이미 전달한다. 애니메이션이 유일한 정보 통로가 아니게 만든 것이 요점.
 *
 * 색은 `color` 프로퍼티가 `--jd-thinking-color`를 세팅한다. 인라인 style을 점마다 바르던
 * v2와 달리 변수 하나라, 소비자가 CSS에서 직접 덮어쓸 수도 있다(§4.4).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import thinkingIndicatorStyles from "./thinking-indicator.css.js";

/** variant → 애니메이션 조각 개수 (v2 동형: dots 3 · wave 4 · 나머지 1) */
const PIECES: Record<string, number> = { dots: 3, pulse: 1, wave: 4, typewriter: 1 };

const FALLBACK_TEXT = "응답을 생성 중입니다";

export class JdThinkingIndicator extends JdElement {
  static override tag = "jd-thinking-indicator";
  static override props = {
    /** dots | pulse | wave | typewriter */
    variant: { type: String, default: "dots", reflect: true },
    /** 좌측 라벨 (예: "Claude가 생각 중"). 비우면 호스트에 쓴 children이 라벨 */
    label: { type: String },
    /** 점 색. 비우면 currentColor */
    color: { type: String },
  };

  declare variant: string;
  declare label: string;
  declare color: string;

  #label!: HTMLElement;
  #anim!: HTMLElement;
  #sr!: HTMLElement;
  #paintedVariant = "";
  #labelOwned = false;

  protected render(): void {
    adoptStyles(thinkingIndicatorStyles);
    const found = this.querySelector<HTMLElement>(":scope > .jd-thinking-indicator__anim");
    if (found) {
      this.#anim = found;
      this.#label = this.querySelector(".jd-thinking-indicator__label")!;
      this.#sr = this.querySelector(".jd-thinking-indicator__sr")!;
      this.#paintedVariant = found.dataset.variant ?? "";
    } else {
      const rest = Array.from(this.childNodes); // children = 라벨(§10.1 선례)
      this.#label = document.createElement("span");
      this.#label.className = "jd-thinking-indicator__label";
      this.#label.append(...rest);
      this.#anim = document.createElement("span");
      this.#anim.className = "jd-thinking-indicator__anim";
      this.#anim.setAttribute("aria-hidden", "true"); // 판단 3
      this.#sr = document.createElement("span");
      this.#sr.className = "jd-thinking-indicator__sr";
      this.append(this.#label, this.#anim, this.#sr);
    }
    // 대기 상태는 "지금 무슨 일이 일어나는지"의 통지다 — 알림이 아니라 상태
    this.setAttribute("role", "status");
    this.setAttribute("aria-live", "polite");
    this.update();
  }

  protected override update(): void {
    const variant = PIECES[this.variant] ? this.variant : "dots";
    if (this.#paintedVariant !== variant) {
      this.#paintedVariant = variant;
      this.#anim.dataset.variant = variant;
      this.#anim.textContent = "";
      for (let i = 0; i < (PIECES[variant] ?? 1); i++) {
        const piece = document.createElement("span");
        piece.className = "jd-thinking-indicator__piece";
        this.#anim.append(piece);
      }
    }

    const label = this.label.trim();
    if (label) {
      this.#label.textContent = label;
      this.#labelOwned = true;
    } else if (this.#labelOwned) {
      this.#label.textContent = "";
      this.#labelOwned = false;
    }
    const hasLabel = this.#label.hasChildNodes();
    this.#label.hidden = !hasLabel;
    // 보이는 라벨이 있으면 그것이 낭독 문장이다 — 중복 문장을 만들지 않는다(판단 2)
    this.#sr.textContent = hasLabel ? "" : FALLBACK_TEXT;

    if (this.color) this.style.setProperty("--jd-thinking-color", this.color);
    else this.style.removeProperty("--jd-thinking-color");
  }
}
