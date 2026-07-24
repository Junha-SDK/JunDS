/**
 * <jd-theme-pill-card> — 테마 이름 + 총 거래대금 한 줄 알약 (v2 finance/ThemeCard의 ThemePillCard).
 *
 * jd-theme-card와 같은 파일에서 왔지만 골격이 전혀 다르다(종목 목록·스파크라인 없이
 * 이름 + 총액 태그 한 줄) — extends 파생이 아니라 별개 요소로 두고, 공유하는 것은
 * fmtEok(억 축약) 2줄뿐이라 로컬 복제한다(daily-themes-calendar가 fmtMoney를 로컬로
 * 두는 것과 동형).
 *
 * v2는 순수 표시용 div였다 — DS도 표시로 유지하되, 총액 태그 색만 v2의 orange를
 * 승계한다(<Tag color="orange">).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import themePillCardStyles from "./theme-pill-card.css.js";

/** 억 → 조/억 한글 축약 (v2 fmtKR억 동형) */
function fmtEok(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, "")}조`;
  return `${Math.round(n).toLocaleString("ko-KR")}억`;
}

export class JdThemePillCard extends JdElement {
  static override tag = "jd-theme-pill-card";
  static override props = {
    name: { type: String },
    /** 총 거래대금(억) */
    total: { type: Number },
  };

  declare name: string;
  declare total: number;

  #name: HTMLElement | null = null;
  #total: HTMLElement | null = null;

  protected render(): void {
    adoptStyles(themePillCardStyles);
    let root = this.querySelector<HTMLElement>(":scope > .jd-theme-pill-card");
    if (root) {
      this.#name = root.querySelector(".jd-theme-pill-card__name");
      this.#total = root.querySelector(".jd-theme-pill-card__total");
    } else {
      root = document.createElement("div");
      root.className = "jd-theme-pill-card";
      this.#name = document.createElement("span");
      this.#name.className = "jd-theme-pill-card__name";
      this.#total = document.createElement("span");
      this.#total.className = "jd-theme-pill-card__total";
      root.append(this.#name, this.#total);
      this.append(root);
    }
    this.update();
  }

  protected override update(): void {
    if (this.#name) this.#name.textContent = this.name;
    if (this.#total) this.#total.textContent = fmtEok(this.total);
  }
}
