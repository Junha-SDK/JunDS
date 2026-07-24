/**
 * <jd-security-badge> — 보안 레벨 뱃지 (v2 composites/SecurityBadge).
 *
 * 판단 3건:
 * 1. **jd-severity-badge 파생이 아니다.** 표면이 비슷해 보이지만 severity-badge는
 *    자식이 0개인 순수 CSS 뱃지(점은 ::before)이고, 여기는 레벨별 **아이콘 도형**과
 *    라벨 텍스트를 갖는다 — 상속해도 물려받을 골격이 없고 레벨 축(5종)도 다르다.
 *    §6 R12는 "관용구가 겹치면" 파생하라는 규칙이지 이름이 비슷하면 파생하라는 규칙이 아니다.
 * 2. **showIcon(기본 true)은 `hide-icon`으로 뒤집었다.** boolean attribute는 존재 자체가
 *    값이라 기본 true를 표현할 수 없다(§1.3, jd-clock hideSeconds·jd-password-strength
 *    hideLabel 선례). 무지정 동작은 v2와 같다.
 * 3. **커스텀 라벨이 심각도를 지운다**는 v2 결함을 메웠다. `label="비밀번호 취약"`을
 *    주면 화면에는 그 문장만 남고 위험도는 **색으로만** 전달된다 — 색각·스크린리더
 *    사용자에게는 정보가 없다. v3는 레벨 기본 라벨("위험")을 숨김 텍스트로 앞세운다.
 *
 * 아이콘 도형·색(Tailwind 50/200/700 계열)은 v2 config를 그대로 옮겼다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import securityBadgeStyles from "./security-badge.css.js";

export type JdSecurityLevel = "critical" | "warning" | "safe" | "verified" | "unverified";

interface LevelConfig {
  /** SVG path d — viewBox 0 0 20 20 (v2 동형) */
  icon: string;
  label: string;
}

const LEVELS: Record<JdSecurityLevel, LevelConfig> = {
  critical: { icon: "M10 2L1.5 17h17L10 2zM10 7v4M10 13.5h.01", label: "위험" },
  warning: { icon: "M10 2L1.5 17h17L10 2zM10 7v4M10 13.5h.01", label: "주의" },
  safe: {
    icon:
      "M9 12l2 2 4-4M5.8 4.5A7.5 7.5 0 0110 3a7.5 7.5 0 014.2 1.5c.2 1.4.3 2.5.3 3.5 " +
      "0 4.5-2 7.5-4.5 9-2.5-1.5-4.5-4.5-4.5-9 0-1 .1-2.1.3-3.5z",
    label: "안전",
  },
  verified: { icon: "M5 10l3.5 3.5L15 7", label: "인증됨" },
  unverified: { icon: "M10 5v5M10 13h.01", label: "미인증" },
};

const isLevel = (v: string): v is JdSecurityLevel =>
  Object.prototype.hasOwnProperty.call(LEVELS, v);

export class JdSecurityBadge extends JdElement {
  static override tag = "jd-security-badge";
  static override props = {
    /** critical | warning | safe | verified | unverified */
    level: { type: String, default: "unverified", reflect: true },
    /** 사용자 정의 라벨. 비우면 레벨 기본 라벨 */
    label: { type: String },
    /** v2 showIcon=true의 반전 플래그 */
    hideIcon: { type: Boolean, reflect: true },
    /** sm | md | lg */
    size: { type: String, default: "md", reflect: true },
  };

  declare level: string;
  declare label: string;
  declare hideIcon: boolean;
  declare size: string;

  #icon!: HTMLElement;
  #srLevel!: HTMLElement;
  #text!: HTMLElement;
  #paintedIcon = "";
  /** 텍스트 노드를 프로퍼티가 소유했는지 — 호스트에 쓴 children과 구분 */
  #textOwned = false;

  protected render(): void {
    adoptStyles(securityBadgeStyles);
    const found = this.querySelector<HTMLElement>(":scope > .jd-security-badge__icon");
    if (found) {
      this.#icon = found;
      this.#srLevel = this.querySelector(".jd-security-badge__sr-level")!;
      this.#text = this.querySelector(".jd-security-badge__text")!;
    } else {
      const rest = Array.from(this.childNodes); // 호스트에 쓴 내용 = 라벨(§10.1 선례)
      this.#icon = document.createElement("span");
      this.#icon.className = "jd-security-badge__icon";
      this.#icon.setAttribute("aria-hidden", "true"); // 도형은 라벨의 중복 표현
      this.#srLevel = document.createElement("span");
      this.#srLevel.className = "jd-security-badge__sr-level jd-security-badge__sr";
      this.#text = document.createElement("span");
      this.#text.className = "jd-security-badge__text";
      this.#text.append(...rest);
      this.append(this.#icon, this.#srLevel, this.#text);
    }
    this.update();
  }

  protected override update(): void {
    const level = isLevel(this.level) ? this.level : "unverified";
    const cfg = LEVELS[level];

    if (this.#paintedIcon !== level) {
      this.#paintedIcon = level;
      // 정적 도형이라 문자열 1회 주입으로 충분하다(좌표가 데이터에 따라 변하는
      // 스파크라인류만 createElementNS가 필요하다 — jd-metric-card 참조)
      this.#icon.innerHTML =
        `<svg viewBox="0 0 20 20" fill="none" focusable="false">` +
        `<path d="${cfg.icon}" stroke="currentColor" stroke-width="1.5" ` +
        `stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    this.#icon.hidden = this.hideIcon;

    // 우선순위: label 프로퍼티 > 호스트에 쓴 children > 레벨 기본 라벨
    const custom = this.label.trim();
    if (custom) {
      this.#text.textContent = custom;
      this.#textOwned = true;
    } else if (this.#textOwned || !this.#text.hasChildNodes()) {
      this.#text.textContent = cfg.label;
      this.#textOwned = true;
    }
    // 커스텀 라벨이 심각도를 가릴 때만 숨김 텍스트로 보충한다(판단 3)
    const shown = (this.#text.textContent ?? "").trim();
    this.#srLevel.textContent = shown && shown !== cfg.label ? `${cfg.label}: ` : "";
  }
}
