/**
 * <jd-alert-header-button> — 헤더용 가격-알림 진입 버튼 (v2 finance/AlertHeaderButton).
 *
 * v2는 `useAlerts()`로 활성 알림 수를 직접 읽어 종(bell) 위에 카운트 배지를 얹었다.
 * v3는 데이터 훅을 걷어내고(DEC-019 — 데이터는 @junds/finance-data 몫) **표시 표면만**
 * 남긴다: `count`를 프로퍼티로 받아 배지를 그리는 링크. 실제 알림 수 계산은 소비자가
 * 주입한다.
 *
 * 링크 대상은 `href`(기본 /alerts). 카운트 배지는 v2와 동형 — 링(테두리)으로 배경에서
 * 떠 보이게 하고, 상승(up) 계열 색을 쓴다.
 *
 * v2 대비 개선: 카운트가 있으면 aria-label에 건수를 실어 스크린리더가 배지를 읽게 한다
 * (v2는 시각적 배지뿐이라 비시각 사용자에게 수가 전달되지 않았다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import alertHeaderButtonStyles from "./alert-header-button.css.js";

/** v2 <AppIcon name="bell" size={18} strokeWidth={1.8} /> 동형. HTML 파서가 svg를
 *  전경(foreign) 콘텐츠로 인식하므로 innerHTML 삽입이 안전하다(NS 함정 밖). */
const BELL_SVG =
  `<svg class="jd-alert-header-button__icon" width="18" height="18" viewBox="0 0 24 24" ` +
  `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ` +
  `stroke-linejoin="round" aria-hidden="true">` +
  `<path d="M10.268 21a2 2 0 0 0 3.464 0"/>` +
  `<path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>` +
  `</svg>`;

export class JdAlertHeaderButton extends JdElement {
  static override tag = "jd-alert-header-button";
  static override props = {
    /** 활성 알림 수 — 0이면 배지 숨김 */
    count: { type: Number, default: 0 },
    href: { type: String, default: "/alerts" },
    label: { type: String, default: "가격 알림" },
  };

  declare count: number;
  declare href: string;
  declare label: string;

  #link!: HTMLAnchorElement;
  #badge!: HTMLSpanElement;

  protected render(): void {
    adoptStyles(alertHeaderButtonStyles);
    const existing = this.querySelector<HTMLAnchorElement>(":scope > a.jd-alert-header-button");
    if (existing) {
      this.#link = existing;
      this.#badge = existing.querySelector(".jd-alert-header-button__badge")!;
    } else {
      this.#link = document.createElement("a");
      this.#link.className = "jd-alert-header-button";
      this.#link.innerHTML = BELL_SVG;
      this.#badge = document.createElement("span");
      this.#badge.className = "jd-alert-header-button__badge";
      this.#badge.setAttribute("aria-hidden", "true");
      this.#link.append(this.#badge);
      this.append(this.#link);
    }
    this.update();
  }

  protected override update(): void {
    if (this.#link.getAttribute("href") !== this.href) this.#link.href = this.href;
    const n = Math.max(0, Math.trunc(this.count));
    const has = n > 0;
    this.#badge.hidden = !has;
    if (has) this.#badge.textContent = n > 99 ? "99+" : String(n);
    this.#link.setAttribute(
      "aria-label",
      has ? `${this.label}, 새 알림 ${n}건` : this.label,
    );
  }
}
