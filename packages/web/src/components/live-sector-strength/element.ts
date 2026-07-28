/**
 * <jd-live-sector-strength> — 섹터 강도 순위 패널 (v2 finance/LiveSectorStrength).
 *
 * v2는 HEATMAP_GROUPS 멤버 종목의 KIS 라이브 등락률을 시총 가중 평균해 섹터별 강도를
 * 실시간 계산·정렬했다. 그 계산(도메인)은 앱에 남기고, DS 컴포넌트는 계산된 `sectors`
 * 배열(또는 JSON 슬롯)을 받아 **가중 등락률 내림차순 순위표**로 그린다.
 *
 * 강도 막대 색은 v2가 heatmapColor로 한국장 적/청 hsl을 **JS에서 직접** 칠했다. 그러면
 * 앱이 --jd-finance-*를 한 번 덮어써도 이 막대만 비껴가 옆의 등락률 글자와 색 체계가
 * 갈린다(DECISIONS: 색 기본값은 웹, 관례 전환은 앱). 그래서 JS에는 **강도(0~1)만** 남기고
 * (--jd-lss-t) 색상은 CSS가 방향 훅에서 뽑는다. 종목/섹터 링크는 href가 있으면 <a>,
 * 없으면 jd-select 이벤트 위임(v2 next/link 하드 의존 제거, portfolio-council 동형).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import liveSectorStrengthStyles from "./live-sector-strength.css.js";

export interface JdSectorStrengthItem {
  name: string;
  /** 가중 등락률(%) */
  wAvg: number;
  upN?: number;
  downN?: number;
  count?: number;
  /** 있으면 섹터명이 링크가 된다 */
  href?: string;
}

const SCALE = 6;

/** v2 heatmapColor에서 색상은 걷어내고 강도 t(0~1)만 남긴 것 — 색은 CSS의 몫 */
function strength(pct: number, scale = SCALE): number {
  if (!Number.isFinite(pct)) return 0;
  return Math.min(1, Math.abs(pct) / scale);
}

export class JdLiveSectorStrength extends JdElement {
  static override tag = "jd-live-sector-strength";
  static override props = {
    heading: { type: String, default: "섹터 강도" },
    caption: { type: String, default: "가중 등락률" },
  };

  declare heading: string;
  declare caption: string;

  #sectors: JdSectorStrengthItem[] = [];
  #headingEl!: HTMLElement;
  #captionEl!: HTMLElement;
  #list!: HTMLUListElement;

  get sectors(): JdSectorStrengthItem[] {
    return this.#sectors;
  }
  set sectors(v: JdSectorStrengthItem[]) {
    this.#sectors = Array.isArray(v) ? v : [];
    if (this.#list) this.#renderRows();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(liveSectorStrengthStyles);
    this.#readJson();

    const head = document.createElement("header");
    head.className = "jd-live-sector-strength__head";
    this.#headingEl = document.createElement("span");
    this.#headingEl.className = "jd-live-sector-strength__title";
    this.#captionEl = document.createElement("span");
    this.#captionEl.className = "jd-live-sector-strength__caption";
    head.append(this.#headingEl, this.#captionEl);

    this.#list = document.createElement("ul");
    this.#list.className = "jd-live-sector-strength__list";

    this.append(head, this.#list);
    this.#renderRows();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdSectorStrengthItem[];
      if (Array.isArray(parsed)) this.#sectors = parsed;
    } catch {
      /* 무시 */
    }
    script.remove();
  }

  #renderRows(): void {
    this.#list.textContent = "";
    const sorted = [...this.#sectors].sort((a, b) => b.wAvg - a.wAvg);
    sorted.forEach((s, i) => this.#list.append(this.#buildRow(s, i)));
  }

  #buildRow(s: JdSectorStrengthItem, i: number): HTMLLIElement {
    const positive = s.wAvg >= 0;
    const li = document.createElement("li");
    li.className = "jd-live-sector-strength__row";
    li.setAttribute("data-dir", positive ? "up" : "down");

    const rank = document.createElement("span");
    rank.className = "jd-live-sector-strength__rank";
    rank.textContent = String(i + 1);

    let name: HTMLElement;
    if (s.href) {
      const a = document.createElement("a");
      a.href = s.href;
      a.className = "jd-live-sector-strength__name";
      name = a;
    } else {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-live-sector-strength__name";
      b.addEventListener("click", () => this.emit("jd-select", { name: s.name }));
      name = b;
    }
    name.textContent = s.name;

    const track = document.createElement("div");
    track.className = "jd-live-sector-strength__track";
    const fill = document.createElement("div");
    fill.className = "jd-live-sector-strength__fill";
    fill.style.width = `${Math.min(100, (Math.abs(s.wAvg) / 5) * 100)}%`;
    // 색이 아니라 강도만 넘긴다 — 방향색은 li의 data-dir이 고른 --jd-lss-dir에서 나온다
    fill.style.setProperty("--jd-lss-t", String(strength(s.wAvg)));
    track.append(fill);

    const pct = document.createElement("span");
    pct.className = "jd-live-sector-strength__pct";
    pct.textContent = `${positive ? "+" : ""}${s.wAvg.toFixed(2)}%`;

    li.append(rank, name, track, pct);
    return li;
  }

  protected override update(): void {
    this.#headingEl.textContent = this.heading;
    this.#captionEl.textContent = this.caption;
  }
}
