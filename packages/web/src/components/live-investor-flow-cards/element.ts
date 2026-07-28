/**
 * <jd-live-investor-flow-cards> — 투자자 순매수 카드 묶음 (v2 finance/LiveInvestorFlowCards).
 *
 * v2는 `/api/kis/investor` 10초 폴링으로 외국인·기관 순매수(억)를 받아 고정 2카드를 그렸다.
 * DS 컴포넌트는 폴링을 앱에 남기고 **표시 전용**으로, `cards` 배열(또는 JSON 슬롯)을 받아
 * N장을 그린다 — 외국인/기관 2장은 그 배열의 기본 사용례일 뿐 하드코딩하지 않는다.
 *
 * 레이아웃: v2가 `<>…</>` 프래그먼트로 카드들을 부모 그리드에 직접 얹었으므로, 호스트는
 * `display:contents`(§ 래퍼 없는 렌더 등가) — 각 카드가 부모 그리드 아이템이 되어 v2 배치를 보존.
 * 등락 방향은 카드별 `data-dir`로 반영 → 색은 CSS. 값이 없으면(null) "—" + 배지 생략.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { svgNode } from "../../core/chart.js";
import liveInvestorFlowCardsStyles from "./live-investor-flow-cards.css.js";

export interface JdInvestorFlowCard {
  label: string;
  /** 순매수 금액(억). null/undefined면 미측정("—") */
  value?: number | null;
  note?: string;
  spark?: number[];
}

/** 억 → "+1.23조" / "+1,234억" / "-567억" (v2 FlowCard 동형) */
function fmtFlow(v: number): string {
  const up = v >= 0;
  const sign = up ? "+" : "";
  if (Math.abs(v) >= 10_000) return `${sign}${(v / 10_000).toFixed(2)}조`;
  return `${sign}${v.toLocaleString("ko-KR")}억`;
}

export class JdLiveInvestorFlowCards extends JdElement {
  static override tag = "jd-live-investor-flow-cards";
  static override props = {};

  #cards: JdInvestorFlowCard[] = [];
  #built = false;

  get cards(): JdInvestorFlowCard[] {
    return this.#cards;
  }
  set cards(v: JdInvestorFlowCard[]) {
    this.#cards = Array.isArray(v) ? v : [];
    // render() 전에는 그리지 않는다 — JSON 슬롯을 지우지 않기 위해(§ 입양).
    if (this.#built) this.#renderCards();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(liveInvestorFlowCardsStyles);
    this.#readJson();
    this.#built = true;
    this.#renderCards();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdInvestorFlowCard[];
      if (Array.isArray(parsed)) this.#cards = parsed;
    } catch {
      /* 무시 */
    }
    script.remove();
  }

  #renderCards(): void {
    this.textContent = "";
    for (const c of this.#cards) this.append(this.#buildCard(c));
  }

  #buildCard(c: JdInvestorFlowCard): HTMLElement {
    const hasValue = c.value != null && Number.isFinite(c.value);
    const v = hasValue ? (c.value as number) : 0;
    const up = v >= 0;

    const card = document.createElement("article");
    card.className = "jd-live-investor-flow-cards__card";
    card.setAttribute("data-dir", up ? "up" : "down");

    const top = document.createElement("div");
    top.className = "jd-live-investor-flow-cards__top";
    const label = document.createElement("span");
    label.className = "jd-live-investor-flow-cards__label";
    label.textContent = c.label;
    top.append(label);
    if (hasValue) {
      const badge = document.createElement("span");
      badge.className = "jd-live-investor-flow-cards__badge";
      badge.setAttribute("aria-hidden", "true");
      badge.textContent = up ? "▲" : "▼";
      top.append(badge);
    }

    const value = document.createElement("div");
    value.className = "jd-live-investor-flow-cards__value";
    value.textContent = hasValue ? fmtFlow(v) : "—";

    card.append(top, value);

    if (c.note) {
      const note = document.createElement("div");
      note.className = "jd-live-investor-flow-cards__note";
      note.textContent = c.note;
      card.append(note);
    }

    const spark = Array.isArray(c.spark) ? c.spark.map(Number).filter(Number.isFinite) : [];
    const svg = this.#buildSpark(spark);
    if (svg) card.append(svg);

    return card;
  }

  #buildSpark(values: number[]): SVGSVGElement | null {
    if (values.length < 2) return null;
    const w = 220;
    const h = 42;
    let min = Infinity;
    let max = -Infinity;
    for (const n of values) {
      if (n < min) min = n;
      if (n > max) max = n;
    }
    const range = max - min || 1;
    const step = w / (values.length - 1);
    const yOf = (n: number): number => h - ((n - min) / range) * h;
    let d = "";
    values.forEach((n, i) => {
      d += `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${yOf(n).toFixed(1)} `;
    });
    d = d.trim();
    const svg = svgNode("svg", "jd-live-investor-flow-cards__spark");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", String(h));
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const area = svgNode("path", "jd-live-investor-flow-cards__spark-area");
    area.setAttribute("d", `${d} L${w},${h} L0,${h} Z`);
    const line = svgNode("path", "jd-live-investor-flow-cards__spark-line");
    line.setAttribute("d", d);
    svg.append(area, line);
    return svg;
  }
}
