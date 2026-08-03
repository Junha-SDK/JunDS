/**
 * <jd-portfolio-council> — 보유 포지션 × AI 거장 위원회 표 (v2 finance/PortfolioCouncil).
 *
 * v2는 useHoldings + useLivePrice + scoreAllInvestors로 행마다 실시간 채점했다. DS 컴포넌트는
 * 도메인 계산(투자자 스코어링·실시간가)을 앱에 남기고 **표시 전용 표**로 둔다: 앱이 계산한
 * 행 배열을 `rows` property(또는 JSON 슬롯)로 싣는다. 종목 클릭은 href가 있으면 <a>로,
 * 없으면 jd-select 이벤트로 위임한다(v2 next/link 하드 의존 제거).
 *
 * v2 대비 개선: 표에 <caption>(sr-only)·scope="col" 부여, 링크 대신 이벤트 위임으로
 * 라우터 비의존, 괴리 배지에 title 유지.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import portfolioCouncilStyles from "./portfolio-council.css.js";

export type JdCouncilTone = "up" | "down" | "flat";

export interface JdCouncilRow {
  name: string;
  qty: number;
  avgCost: number;
  livePrice: number;
  /** 손익률(-1..) — 0.15 = +15% */
  pnlPct: number;
  bulls: number;
  bears: number;
  verdictTone: JdCouncilTone;
  /** 매수 의견 거장 이모지 */
  councilEmojis?: string[];
  /** 위원회 의견과 손익이 어긋남 */
  divergence?: boolean;
  /** 있으면 종목명이 링크가 된다 */
  href?: string;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const ICON_WALLET =
  '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>';

function iconSvg(paths: string, size: number, cls: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", cls);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2.4");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = paths;
  return svg;
}

const won = (n: number): string => Math.round(n).toLocaleString("ko-KR");

const VERDICT: Record<JdCouncilTone, string> = {
  up: "▲ 다수 매수",
  down: "▼ 다수 매도",
  flat: "관망 우세",
};

const COLUMNS = ["종목", "수량", "평단", "현재", "손익률", "위원회", "의견"];

export class JdPortfolioCouncil extends JdElement {
  static override tag = "jd-portfolio-council";
  static override props = {
    heading: { type: String, default: "내 포지션 × AI 위원회" },
    /** 앱이 계산 중이면 true → 스켈레톤 */
    loading: { type: Boolean, reflect: true },
    /** 보유 없음 안내 문구 */
    emptyTitle: { type: String, default: "보유 종목이 없습니다" },
    emptyDesc: {
      type: String,
      default: "보유 종목을 등록하면 위원회 의견을 자동으로 매핑해드립니다.",
    },
  };

  declare heading: string;
  declare loading: boolean;
  declare emptyTitle: string;
  declare emptyDesc: string;

  #rows: JdCouncilRow[] = [];
  #skeleton!: HTMLElement;
  #empty!: HTMLElement;
  #panel!: HTMLElement;
  #headingEl!: HTMLElement;
  #count!: HTMLElement;
  #tbody!: HTMLTableSectionElement;
  #emptyTitleEl!: HTMLElement;
  #emptyDescEl!: HTMLElement;

  get rows(): JdCouncilRow[] {
    return this.#rows;
  }
  set rows(v: JdCouncilRow[]) {
    this.#rows = Array.isArray(v) ? v : [];
    if (this.#tbody) this.#renderRows();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(portfolioCouncilStyles);
    this.#readJson();
    this.#build();
    this.#renderRows();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdCouncilRow[];
      if (Array.isArray(parsed)) this.#rows = parsed;
    } catch {
      /* 무시 */
    }
    script.remove();
  }

  #build(): void {
    this.textContent = "";

    // 스켈레톤
    this.#skeleton = document.createElement("div");
    this.#skeleton.className = "jd-portfolio-council__skeleton";

    // 빈 상태
    this.#empty = document.createElement("div");
    this.#empty.className = "jd-portfolio-council__empty";
    this.#empty.append(iconSvg(ICON_WALLET, 22, "jd-portfolio-council__empty-icon"));
    this.#emptyTitleEl = document.createElement("div");
    this.#emptyTitleEl.className = "jd-portfolio-council__empty-title";
    this.#emptyDescEl = document.createElement("div");
    this.#emptyDescEl.className = "jd-portfolio-council__empty-desc";
    this.#empty.append(this.#emptyTitleEl, this.#emptyDescEl);

    // 본체 패널
    this.#panel = document.createElement("div");
    this.#panel.className = "jd-portfolio-council__panel";
    const head = document.createElement("div");
    head.className = "jd-portfolio-council__head";
    const titleGroup = document.createElement("div");
    titleGroup.className = "jd-portfolio-council__title";
    titleGroup.append(iconSvg(ICON_WALLET, 14, "jd-portfolio-council__icon"));
    this.#headingEl = document.createElement("span");
    titleGroup.append(this.#headingEl);
    this.#count = document.createElement("span");
    this.#count.className = "jd-portfolio-council__count";
    head.append(titleGroup, this.#count);

    const scroll = document.createElement("div");
    scroll.className = "jd-portfolio-council__scroll";
    const table = document.createElement("table");
    table.className = "jd-portfolio-council__table";
    const caption = document.createElement("caption");
    caption.className = "jd-portfolio-council__caption";
    caption.textContent = "보유 종목별 위원회 의견";
    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    for (const c of COLUMNS) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = c;
      trh.append(th);
    }
    thead.append(trh);
    this.#tbody = document.createElement("tbody");
    table.append(caption, thead, this.#tbody);
    scroll.append(table);
    this.#panel.append(head, scroll);

    this.append(this.#skeleton, this.#empty, this.#panel);
  }

  #renderRows(): void {
    this.#tbody.textContent = "";
    for (const r of this.#rows) this.#tbody.append(this.#buildRow(r));
  }

  #buildRow(r: JdCouncilRow): HTMLTableRowElement {
    const tr = document.createElement("tr");
    if (r.divergence) tr.dataset.divergence = "";

    // 종목
    const nameTd = document.createElement("td");
    let nameEl: HTMLAnchorElement | HTMLButtonElement;
    if (r.href) {
      const a = document.createElement("a");
      a.href = r.href;
      a.className = "jd-portfolio-council__name";
      nameEl = a;
    } else {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-portfolio-council__name";
      b.addEventListener("click", () => this.emit("jd-select", { name: r.name }));
      nameEl = b;
    }
    nameEl.textContent = r.name;
    nameTd.append(nameEl);
    if (r.divergence) {
      const warn = document.createElement("span");
      warn.className = "jd-portfolio-council__warn";
      warn.textContent = "⚠ 괴리";
      warn.title = "포지션 손익과 위원회 의견이 어긋납니다.";
      nameTd.append(warn);
    }

    // 수량 · 평단
    const qtyTd = this.#numTd(r.qty.toLocaleString("ko-KR"), "muted");
    const avgTd = this.#numTd(r.avgCost.toLocaleString("ko-KR"), "muted");
    // 현재
    const priceTd = this.#numTd(won(r.livePrice));

    // 손익률
    const pnlTd = this.#numTd(
      `${r.pnlPct >= 0 ? "+" : ""}${(r.pnlPct * 100).toFixed(2)}%`,
      r.pnlPct >= 0 ? "up" : "down",
    );
    pnlTd.classList.add("jd-portfolio-council__strong");

    // 위원회 이모지
    const councilTd = document.createElement("td");
    const council = document.createElement("div");
    council.className = "jd-portfolio-council__emojis";
    for (const e of r.councilEmojis ?? []) {
      const span = document.createElement("span");
      span.textContent = e;
      council.append(span);
    }
    councilTd.append(council);

    // 의견
    const verdictTd = document.createElement("td");
    verdictTd.className = "jd-portfolio-council__verdict";
    verdictTd.dataset.tone = r.verdictTone;
    const vLabel = document.createElement("span");
    vLabel.textContent = VERDICT[r.verdictTone];
    const vCount = document.createElement("span");
    vCount.className = "jd-portfolio-council__ratio";
    vCount.textContent = `${r.bulls}▲ / ${r.bears}▼`;
    verdictTd.append(vLabel, vCount);

    tr.append(nameTd, qtyTd, avgTd, priceTd, pnlTd, councilTd, verdictTd);
    return tr;
  }

  #numTd(text: string, tone?: "up" | "down" | "muted"): HTMLTableCellElement {
    const td = document.createElement("td");
    td.className = "jd-portfolio-council__num";
    if (tone) td.dataset.tone = tone;
    td.textContent = text;
    return td;
  }

  protected override update(): void {
    this.#headingEl.textContent = this.heading;
    this.#count.textContent = `보유 ${this.#rows.length}종목`;
    this.#emptyTitleEl.textContent = this.emptyTitle;
    this.#emptyDescEl.textContent = this.emptyDesc;

    const isEmpty = !this.loading && this.#rows.length === 0;
    const hasData = !this.loading && this.#rows.length > 0;
    this.#skeleton.hidden = !this.loading;
    this.#empty.hidden = !isEmpty;
    this.#panel.hidden = !hasData;
  }
}
