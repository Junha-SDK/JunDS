/**
 * <jd-live-status-dot> — 장 세션 라이브 여부를 점+라벨로 알리는 표시(v2 finance/LivePrice
 * `LiveStatusDot`). 라이브면 초록 점이 글로우 링을 뿜고 "실시간", 아니면 회색 점 + "장마감".
 *
 * v2는 useMarketStatus() 훅으로 장 세션을 읽고 setInterval로 펄스를 토글했다. DS는 의존성
 * 0이라 장 세션 계산(공휴일·NXT 프리/애프터)을 옮길 수 없다 — 세션 판정은 앱이 하고
 * **결과(live 여부)만 property로 주입받는다**(형제 finance 컴포넌트와 같은 판단).
 * 라벨은 기본 "실시간"/"장마감"이되, 앱이 "휴장" 같은 세부 세션명을 label로 덮어쓸 수 있다.
 *
 * v2 대비 교정 2건:
 *  1. 펄스를 JS setInterval(800ms)+box-shadow 토글로 굴렸다 → **CSS 키프레임**으로 옮겨
 *     타이머 없이 확장-소멸 링을 그린다(결정적 렌더·감속 선호 대응이 CSS 한 곳에 모인다).
 *  2. 점을 aria-hidden으로 내리고 상태는 라벨 텍스트가 낭독한다(v2 동형이나 명시).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import styles from "./live-status-dot.css.js";

export class JdLiveStatusDot extends JdElement {
  static override tag = "jd-live-status-dot";
  static override props = {
    /** 라이브 세션(장중·프리·애프터) 여부. 앱이 판정해 주입 */
    live: { type: Boolean, reflect: true },
    /** 라벨 override. 비우면 live→"실시간" / 그 외→"장마감" */
    label: { type: String },
  };

  declare live: boolean;
  declare label: string;

  #dot!: HTMLElement;
  #label!: HTMLElement;

  protected render(): void {
    adoptStyles(styles);
    let dot = this.querySelector<HTMLElement>(":scope > .jd-live-status-dot__dot");
    let label = this.querySelector<HTMLElement>(":scope > .jd-live-status-dot__label");
    if (!dot || !label) {
      dot = document.createElement("span");
      dot.className = "jd-live-status-dot__dot";
      dot.setAttribute("aria-hidden", "true");
      label = document.createElement("span");
      label.className = "jd-live-status-dot__label";
      this.replaceChildren(dot, label);
    }
    this.#dot = dot;
    this.#label = label;
    this.update();
  }

  protected override update(): void {
    this.#label.textContent = this.label || (this.live ? "실시간" : "장마감");
  }
}
