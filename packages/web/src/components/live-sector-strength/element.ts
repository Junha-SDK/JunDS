/**
 * <jd-live-sector-strength> — 섹터 강도 순위 패널 (v2 finance/LiveSectorStrength).
 *
 * v2는 HEATMAP_GROUPS 멤버 종목의 KIS 라이브 등락률을 시총 가중 평균해 섹터별 강도를
 * 실시간 계산·정렬했다. 그 계산(도메인)은 앱에 남기고, DS 컴포넌트는 계산된 `sectors`
 * 배열(또는 JSON 슬롯)을 받아 **가중 등락률 내림차순 순위표**로 그린다.
 *
 * 강도 막대 색은 v2 heatmapColor(한국장 red=상승·blue=하락, 강도에 따라 채도/명도 심화)를
 * 순수 함수로 그대로 이식한다(값→색 매핑은 표시 로직). 종목/섹터 링크는 href가 있으면 <a>,
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

/** v2 heatmapColor 이식 — 한국장 red/blue, 강도 t로 채도·명도 심화 */
function heatmapColor(pct: number, scale = SCALE): string {
  const clamped = Math.max(-scale, Math.min(scale, pct));
  const t = Math.min(1, Math.abs(clamped) / scale);
  if (Math.abs(clamped) < 0.1) return "hsl(220, 10%, 52%)";
  if (clamped > 0) return `hsl(358, ${76 + 16 * t}%, ${58 - 14 * t}%)`;
  return `hsl(218, ${74 + 18 * t}%, ${58 - 16 * t}%)`;
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
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
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
    fill.style.background = heatmapColor(s.wAvg);
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
