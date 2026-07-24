/**
 * <jd-backtest-runner> — 거장 전략 백테스트 실행/결과 (v2 finance/BacktestRunner).
 *
 * v2는 backtestInvestor() 엔진 + INVESTORS/searchStocks를 컴포넌트 안에서 돌렸다. DS 컴포넌트는
 * 도메인 엔진을 앱에 남기고 **선택 UI + 결과 표시**만 소유한다: 거장/종목/기간 선택이 바뀌면
 * jd-change {investor, symbol, bars}를 발행하고, 앱이 계산한 `result`(BacktestResult)를 다시
 * property로 싣는다. 거장 목록·종목 목록도 property(또는 data-slot JSON)로 받는다.
 *
 * 자산곡선 SVG는 createElementNS로 만든다(HTML 파서 <polyline>은 안 그려진다, §6-1).
 * v2 대비 개선: 결정적 초기 렌더(선택값만, 랜덤/Date 없음), 기간 버튼에 aria-pressed,
 * 종목 서제스트에 listbox 없이 버튼 목록(단순 위임).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createClickOutside } from "../../behaviors/input.js";
import backtestRunnerStyles from "./backtest-runner.css.js";

export interface JdInvestorOption {
  id: string;
  name: string;
  emoji: string;
}
export interface JdStockOption {
  name: string;
  sector?: string;
}
export interface JdBacktestPoint {
  equity: number;
  buyHold: number;
}
export interface JdBacktestResult {
  bars: number;
  totalReturn: number;
  buyHoldReturn: number;
  cagr: number;
  buyHoldCagr: number;
  maxDrawdown: number;
  trades: number;
  verdictHist: Record<string, number>;
  points: JdBacktestPoint[];
}

const SVG_NS = "http://www.w3.org/2000/svg";
const RANGES: { key: number; label: string }[] = [
  { key: 60, label: "60일" },
  { key: 120, label: "120일" },
  { key: 250, label: "1년" },
  { key: 500, label: "2년" },
];
const VERDICTS = ["강력매수", "매수", "관망", "매도", "강력매도"];

function svgEl<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function searchStocks(list: JdStockOption[], query: string, limit: number): JdStockOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { s: JdStockOption; score: number }[] = [];
  for (const s of list) {
    let score = 0;
    const name = s.name.toLowerCase();
    if (name.startsWith(q)) score += 100;
    else if (name.includes(q)) score += 50;
    if (s.sector?.toLowerCase().includes(q)) score += 10;
    if (score > 0) scored.push({ s, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.s);
}

const pct = (v: number): string => `${(v * 100).toFixed(2)}%`;

export class JdBacktestRunner extends JdElement {
  static override tag = "jd-backtest-runner";
  static override props = {
    investor: { type: String, default: "buffett", reflect: true },
    symbol: { type: String, default: "삼성전자", reflect: true },
    bars: { type: Number, default: 250, reflect: true },
  };

  declare investor: string;
  declare symbol: string;
  declare bars: number;

  #investors: JdInvestorOption[] = [];
  #stocks: JdStockOption[] = [];
  #result: JdBacktestResult | null = null;

  #select!: HTMLSelectElement;
  #symbolInput!: HTMLInputElement;
  #suggest!: HTMLElement;
  #rangeBtns: HTMLButtonElement[] = [];
  #results!: HTMLElement;
  #headTitle!: HTMLElement;
  #statGrid!: HTMLElement;
  #chartHolder!: HTMLElement;
  #histogram!: HTMLElement;

  get investors(): JdInvestorOption[] {
    return this.#investors;
  }
  set investors(v: JdInvestorOption[]) {
    this.#investors = Array.isArray(v) ? v : [];
    if (this.#select) this.#renderInvestorOptions();
    this.requestUpdate();
  }
  get stocks(): JdStockOption[] {
    return this.#stocks;
  }
  set stocks(v: JdStockOption[]) {
    this.#stocks = Array.isArray(v) ? v : [];
  }
  get result(): JdBacktestResult | null {
    return this.#result;
  }
  set result(v: JdBacktestResult | null) {
    this.#result = v && typeof v === "object" ? v : null;
    if (this.#results) this.#renderResult();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(backtestRunnerStyles);
    this.#readJsonSlots();
    this.#build();
    this.#renderInvestorOptions();
    this.#renderResult();
    this.update();
  }

  protected override connected(): void {
    this.own(
      createClickOutside(this.#suggest, (e) => {
        if (e.target === this.#symbolInput) return;
        this.#hideSuggest();
      }),
    );
  }

  #readJsonSlots(): void {
    const scripts = this.querySelectorAll<HTMLScriptElement>(':scope > script[type="application/json"]');
    scripts.forEach((script) => {
      const slot = script.dataset.slot;
      try {
        const parsed = JSON.parse(script.textContent || "null");
        if (slot === "investors" && Array.isArray(parsed)) this.#investors = parsed;
        else if (slot === "stocks" && Array.isArray(parsed)) this.#stocks = parsed;
        else if (slot === "result" && parsed && typeof parsed === "object") this.#result = parsed;
      } catch {
        /* 무시 */
      }
      script.remove();
    });
  }

  #build(): void {
    this.textContent = "";

    /* ── 설정 섹션 ── */
    const settings = document.createElement("section");
    settings.className = "jd-backtest-runner__card jd-backtest-runner__settings";
    const sHead = document.createElement("div");
    sHead.className = "jd-backtest-runner__settings-head";
    sHead.append(this.#sparkles(), textSpan("백테스트 설정", "jd-backtest-runner__settings-title"));
    const grid = document.createElement("div");
    grid.className = "jd-backtest-runner__grid";

    // 거장
    const investorField = field("거장");
    this.#select = document.createElement("select");
    this.#select.className = "jd-backtest-runner__control";
    this.#select.setAttribute("aria-label", "거장");
    this.#select.addEventListener("change", () => {
      this.investor = this.#select.value;
      this.#emitChange();
    });
    investorField.append(this.#select);

    // 종목
    const symbolField = field("종목");
    symbolField.classList.add("jd-backtest-runner__symbol-field");
    this.#symbolInput = document.createElement("input");
    this.#symbolInput.className = "jd-backtest-runner__control";
    this.#symbolInput.placeholder = "종목명 검색";
    this.#symbolInput.setAttribute("aria-label", "종목명 검색");
    this.#symbolInput.autocomplete = "off";
    this.#symbolInput.addEventListener("input", () => this.#onSymbolInput());
    this.#symbolInput.addEventListener("focus", () => this.#onSymbolInput());
    this.#suggest = document.createElement("ul");
    this.#suggest.className = "jd-backtest-runner__suggest";
    this.#suggest.hidden = true;
    symbolField.append(this.#symbolInput, this.#suggest);

    // 기간
    const rangeField = field("기간");
    const rangeRow = document.createElement("div");
    rangeRow.className = "jd-backtest-runner__ranges";
    this.#rangeBtns = RANGES.map((r) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-backtest-runner__range";
      b.textContent = r.label;
      b.dataset.value = String(r.key);
      b.addEventListener("click", () => {
        this.bars = r.key;
        this.#emitChange();
      });
      rangeRow.append(b);
      return b;
    });
    rangeField.append(rangeRow);

    grid.append(investorField, symbolField, rangeField);
    settings.append(sHead, grid);

    /* ── 결과 섹션 ── */
    this.#results = document.createElement("section");
    this.#results.className = "jd-backtest-runner__card jd-backtest-runner__results";
    const rHead = document.createElement("div");
    rHead.className = "jd-backtest-runner__results-head";
    this.#headTitle = document.createElement("div");
    this.#headTitle.className = "jd-backtest-runner__results-title";
    rHead.append(this.#headTitle, textSpan("5거래일마다 재평가", "jd-backtest-runner__results-note"));
    this.#statGrid = document.createElement("div");
    this.#statGrid.className = "jd-backtest-runner__stat-grid";
    this.#chartHolder = document.createElement("div");
    this.#chartHolder.className = "jd-backtest-runner__chart";
    this.#histogram = document.createElement("div");
    this.#histogram.className = "jd-backtest-runner__histogram";
    this.#results.append(rHead, this.#statGrid, this.#chartHolder, this.#histogram);

    this.append(settings, this.#results);
  }

  #sparkles(): SVGSVGElement {
    const svg = svgEl("svg", {
      class: "jd-backtest-runner__spark-icon",
      viewBox: "0 0 24 24", width: 14, height: 14, fill: "none",
      stroke: "currentColor", "stroke-width": "2.4",
      "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true",
    });
    svg.innerHTML =
      '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>';
    return svg;
  }

  #renderInvestorOptions(): void {
    this.#select.textContent = "";
    for (const inv of this.#investors) {
      const opt = document.createElement("option");
      opt.value = inv.id;
      opt.textContent = `${inv.emoji} ${inv.name}`;
      this.#select.append(opt);
    }
    if (this.#investors.length) this.#select.value = this.investor;
  }

  #onSymbolInput(): void {
    const matches = searchStocks(this.#stocks, this.#symbolInput.value, 6);
    if (matches.length === 0) {
      this.#hideSuggest();
      return;
    }
    this.#suggest.textContent = "";
    for (const s of matches) {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-backtest-runner__suggest-item";
      b.textContent = s.name;
      if (s.sector) {
        const sec = document.createElement("span");
        sec.className = "jd-backtest-runner__suggest-sector";
        sec.textContent = `· ${s.sector}`;
        b.append(sec);
      }
      b.addEventListener("click", () => {
        this.symbol = s.name;
        this.#symbolInput.value = s.name;
        this.#hideSuggest();
        this.#emitChange();
      });
      li.append(b);
      this.#suggest.append(li);
    }
    this.#suggest.hidden = false;
  }

  #hideSuggest(): void {
    this.#suggest.hidden = true;
    this.#suggest.textContent = "";
  }

  #emitChange(): void {
    this.emit("jd-change", { investor: this.investor, symbol: this.symbol, bars: this.bars });
  }

  #investorMeta(): JdInvestorOption | undefined {
    return this.#investors.find((i) => i.id === this.investor);
  }

  #renderResult(): void {
    const r = this.#result;
    this.#results.hidden = !r;
    if (!r) return;

    // 스탯 8종
    const winUp = r.totalReturn > r.buyHoldReturn;
    const diff = (r.totalReturn - r.buyHoldReturn) * 100;
    this.#statGrid.textContent = "";
    const tiles: [string, string, ("up" | "down" | "win" | "none")?][] = [
      ["전략 수익률", pct(r.totalReturn), r.totalReturn >= 0 ? "up" : "down"],
      ["매수보유 수익률", pct(r.buyHoldReturn), r.buyHoldReturn >= 0 ? "up" : "down"],
      ["vs. 매수보유", `${winUp ? "+" : ""}${diff.toFixed(2)}%p`, "win"],
      ["MDD", pct(r.maxDrawdown), "down"],
      ["연환산 (CAGR)", pct(r.cagr), "none"],
      ["매수보유 CAGR", pct(r.buyHoldCagr), "none"],
      ["포지션 변경", `${r.trades}회`, "none"],
      ["총 봉 수", `${r.bars}개`, "none"],
    ];
    for (const [label, value, tone] of tiles) {
      const tile = document.createElement("div");
      tile.className = "jd-backtest-runner__stat";
      const l = document.createElement("span");
      l.className = "jd-backtest-runner__stat-label";
      l.textContent = label;
      const v = document.createElement("span");
      v.className = "jd-backtest-runner__stat-value";
      if (tone === "win") v.dataset.tone = winUp ? "up" : "down";
      else if (tone && tone !== "none") v.dataset.tone = tone;
      v.textContent = value;
      tile.append(l, v);
      this.#statGrid.append(tile);
    }

    // 자산곡선
    this.#chartHolder.textContent = "";
    const svg = this.#buildEquitySvg(r);
    if (svg) this.#chartHolder.append(svg);

    // 의견 분포
    this.#histogram.textContent = "";
    this.#histogram.append(textSpan("의견 분포", "jd-backtest-runner__histogram-label"));
    for (const v of VERDICTS) {
      const item = document.createElement("span");
      item.className = "jd-backtest-runner__verdict";
      const name = document.createElement("span");
      name.className = "jd-backtest-runner__verdict-name";
      name.textContent = v;
      const count = document.createElement("span");
      count.className = "jd-backtest-runner__verdict-count";
      count.dataset.tone = v.includes("매수") ? "up" : v.includes("매도") ? "down" : "flat";
      count.textContent = String(r.verdictHist?.[v] ?? 0);
      item.append(name, count);
      this.#histogram.append(item);
    }
  }

  #buildEquitySvg(r: JdBacktestResult): SVGSVGElement | null {
    const points = r.points ?? [];
    if (points.length === 0) return null;
    const W = 1100, H = 220;
    const pad = { l: 36, r: 8, t: 12, b: 24 };
    const innerW = W - pad.l - pad.r;
    const innerH = H - pad.t - pad.b;
    let min = Infinity, max = -Infinity;
    for (const p of points) {
      min = Math.min(min, p.equity, p.buyHold);
      max = Math.max(max, p.equity, p.buyHold);
    }
    const range = max - min || 1;
    const x = (i: number): number => pad.l + (i / Math.max(1, points.length - 1)) * innerW;
    const y = (v: number): number => pad.t + innerH - ((v - min) / range) * innerH;
    const line = (sel: (p: JdBacktestPoint) => number): string =>
      points.map((p, i) => `${x(i).toFixed(1)},${y(sel(p)).toFixed(1)}`).join(" ");

    const svg = svgEl("svg", {
      class: "jd-backtest-runner__equity", width: "100%",
      viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none",
      role: "img", "aria-label": "전략 자산곡선과 매수보유 비교",
    });
    const y1 = y(1);
    svg.append(
      svgEl("line", {
        x1: pad.l, x2: W - pad.r, y1, y2: y1, class: "jd-backtest-runner__baseline",
        "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke",
      }),
    );
    const label = svgEl("text", {
      x: pad.l - 4, y: y1 + 3, class: "jd-backtest-runner__axis", "font-size": 10, "text-anchor": "end",
    });
    label.textContent = "1.00";
    svg.append(label);
    svg.append(
      svgEl("polyline", {
        points: line((p) => p.buyHold), fill: "none", class: "jd-backtest-runner__line-bh",
        "stroke-width": 1.5, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke",
      }),
    );
    svg.append(
      svgEl("polyline", {
        points: line((p) => p.equity), fill: "none", class: "jd-backtest-runner__line-eq",
        "stroke-width": 2.2, "vector-effect": "non-scaling-stroke",
      }),
    );

    // 범례
    const g = svgEl("g", { transform: `translate(${pad.l + 6}, ${pad.t + 6})` });
    g.append(svgEl("rect", { width: 160, height: 34, class: "jd-backtest-runner__legend-box", rx: 6 }));
    g.append(svgEl("line", { x1: 8, y1: 12, x2: 20, y2: 12, class: "jd-backtest-runner__line-eq", "stroke-width": 2.2 }));
    const t1 = svgEl("text", { x: 24, y: 15, class: "jd-backtest-runner__legend-eq", "font-size": 10, "font-weight": 700 });
    t1.textContent = "전략";
    g.append(t1);
    g.append(svgEl("line", { x1: 8, y1: 26, x2: 20, y2: 26, class: "jd-backtest-runner__line-bh", "stroke-width": 1.5, "stroke-dasharray": "3 2" }));
    const t2 = svgEl("text", { x: 24, y: 29, class: "jd-backtest-runner__legend-bh", "font-size": 10, "font-weight": 700 });
    t2.textContent = "매수보유";
    g.append(t2);
    svg.append(g);
    return svg;
  }

  protected override update(): void {
    // 셀렉트 값 동기화(옵션이 있을 때만)
    if (this.#investors.length && this.#select.value !== this.investor) {
      this.#select.value = this.investor;
    }
    // 종목 입력 — 편집 중이 아니면 symbol 반영
    if (document.activeElement !== this.#symbolInput && this.#symbolInput.value !== this.symbol) {
      this.#symbolInput.value = this.symbol;
    }
    // 기간 버튼 active
    for (const b of this.#rangeBtns) {
      const active = Number(b.dataset.value) === this.bars;
      b.dataset.active = String(active);
      b.setAttribute("aria-pressed", String(active));
    }
    // 결과 헤드 텍스트
    const meta = this.#investorMeta();
    this.#headTitle.textContent = "";
    if (meta) {
      const emoji = document.createElement("span");
      emoji.className = "jd-backtest-runner__head-emoji";
      emoji.textContent = meta.emoji;
      this.#headTitle.append(emoji);
    }
    this.#headTitle.append(
      document.createTextNode(`${meta ? meta.name : this.investor} · ${this.symbol} · ${this.bars}일`),
    );
  }
}

function field(labelText: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "jd-backtest-runner__field";
  const label = document.createElement("label");
  label.className = "jd-backtest-runner__label";
  label.textContent = labelText;
  wrap.append(label);
  return wrap;
}

function textSpan(text: string, cls: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = cls;
  span.textContent = text;
  return span;
}
