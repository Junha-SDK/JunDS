/**
 * <jd-hint> — 인라인 보조 텍스트 (v2 composites/Hint).
 * Tooltip이 hover에서만 보인다면 Hint는 **항상 보인다** — 폼 도움말·미세 안내가 자리다.
 *
 * v2 결함 교정(WCAG 1.4.1 — 색만으로 정보 전달 금지): v2는 변형을 색과 이모지로만
 * 구분했고 이모지에는 `aria-hidden`이 붙어 있었다. 즉 스크린리더에는 info·tip·warning이
 * **전부 같은 한 문장**으로 들린다. v3는 변형명을 시각적으로만 숨긴 접두 텍스트로 넣어
 * 시각 표현은 v2 그대로 두고 비시각 경로만 복구한다(muted는 의미가 없어 접두 없음).
 *
 * 골격은 1회 구축 후 텍스트만 갱신 — 변형 색은 호스트 속성 셀렉터가 처리한다(§4.3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import hintStyles from "./hint.css.js";

/** v2 defaultIcons 동형 */
const GLYPH: Record<string, string> = {
  info: "ⓘ",
  tip: "✓",
  warning: "⚠",
  muted: "·",
};

/** 색이 유일한 신호가 되지 않도록 하는 비시각 접두 */
const SR_PREFIX: Record<string, string> = {
  info: "정보",
  tip: "도움말",
  warning: "주의",
  muted: "",
};

export class JdHint extends JdElement {
  static override tag = "jd-hint";
  static override props = {
    /** info | tip | warning | muted */
    variant: { type: String, default: "muted", reflect: true },
    /** 기본 글리프 대신 쓸 문자(이모지 포함). 비우면 변형 기본값 */
    icon: { type: String },
  };

  declare variant: string;
  declare icon: string;

  #icon!: HTMLSpanElement;
  #sr!: HTMLSpanElement;

  protected render(): void {
    adoptStyles(hintStyles);
    // 입양 규칙(§3.3) — SSR/프리렌더 골격 재사용
    const body = this.querySelector<HTMLSpanElement>(":scope > .jd-hint__text");
    if (body) {
      this.#icon = this.querySelector<HTMLSpanElement>(":scope > .jd-hint__icon")!;
      this.#sr = this.querySelector<HTMLSpanElement>(":scope > .jd-hint__sr")!;
      this.update();
      return;
    }
    const text = document.createElement("span");
    text.className = "jd-hint__text";
    text.append(...this.childNodes); // 사용자가 쓴 children을 본문으로 이동

    this.#icon = document.createElement("span");
    this.#icon.className = "jd-hint__icon";
    this.#icon.setAttribute("aria-hidden", "true");
    this.#sr = document.createElement("span");
    this.#sr.className = "jd-hint__sr";

    this.append(this.#icon, this.#sr, text); // 접두는 본문보다 앞 — 읽는 순서 = 보는 순서
    this.update();
  }

  protected override update(): void {
    this.#icon.textContent = this.icon || GLYPH[this.variant] || GLYPH.muted!;
    const prefix = SR_PREFIX[this.variant] ?? "";
    this.#sr.textContent = prefix;
    this.#sr.hidden = prefix === "";
  }
}
