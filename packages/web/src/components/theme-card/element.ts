/**
 * <jd-theme-card> — 테마 블록 카드 (v2 finance/ThemeCard).
 *
 * v2는 카드가 스스로 KIS 시세를 폴링하고(useRealPrices/useLivePrice) sparkline을
 * fetch 했다. DS 컴포넌트는 데이터를 소유하지 않는다 — 테마 블록·트렌드를 소비자가
 * 주입하고, 카드는 순수하게 그린다(§1.3 복합 데이터는 property + JSON 슬롯).
 *
 * 데이터 2경로:
 *  1. `theme` 프로퍼티 (JdThemeBlock)
 *  2. 자식 `<script type="application/json">{…}</script>` 슬롯 (jd-radio-group 선례)
 *  트렌드는 `trend` 프로퍼티(number[]) — 있으면 상단 스파크라인을 그린다.
 *
 * 차트는 **createElementNS**로 만든다(네임스페이스 함정 — 문자열+innerHTML 경로는
 * HTML 파서를 타고 미지 요소로 앉아 아무것도 그려지지 않는다. jd-mini-chart 선례).
 *
 * v2 대비 개선:
 *  - 종목 행이 v2는 `<Link>`였다. DS는 실제 `<a href>`(SSR·접근성)로 두되 경로 베이스를
 *    `stock-href-base`로 열어 앱 라우팅과 무관하게 동작한다.
 *  - 비수치 트렌드(NaN/Infinity)를 대입 시점에 걸러 path가 통째로 사라지는 것을 막는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import themeCardStyles from "./theme-card.css.js";

const NS = "http://www.w3.org/2000/svg";

export interface JdThemeStock {
  name: string;
  price: number;
  pct: number;
  /** 거래대금(억) */
  "amount억": number;
  hot?: boolean;
  king?: boolean;
}

export interface JdThemeBlock {
  name: string;
  /** 총 거래대금(억) */
  "total억": number;
  headline?: string;
  starred?: boolean;
  stocks: JdThemeStock[];
}

/** 억 → 조/억 한글 축약 (v2 fmtKR억 동형) */
function fmtEok(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, "")}조`;
  return `${Math.round(n).toLocaleString("ko-KR")}억`;
}

/** 부동소수 꼬리를 잘라 프리렌더 스냅샷 diff를 안정화(jd-mini-chart 선례) */
const num = (v: number): string => String(Math.round(v * 1000) / 1000);

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(NS, tag);
}

export class JdThemeCard extends JdElement {
  static override tag = "jd-theme-card";
  static override props = {
    /** 종목 행 링크 베이스 — `${base}${encodeURIComponent(name)}` */
    stockHrefBase: { type: String, default: "/stock/" },
    // theme(Object)·trend(Array)는 property 전용(§1.3)
  };

  declare stockHrefBase: string;

  #theme: JdThemeBlock | null = null;
  #trend: number[] = [];
  #root: HTMLElement | null = null;

  get theme(): JdThemeBlock | null {
    return this.#theme;
  }
  set theme(v: JdThemeBlock | null) {
    this.#theme = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }

  get trend(): number[] {
    return this.#trend;
  }
  set trend(v: number[]) {
    this.#trend = Array.isArray(v) ? v.filter((n): n is number => Number.isFinite(n)) : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(themeCardStyles);
    this.#readJsonSlot();
    // 입양(§3.3) — 프리렌더/어댑터가 그린 골격이 있으면 재사용
    this.#root = this.querySelector<HTMLElement>(":scope > article.jd-theme-card");
    if (!this.#root) {
      this.#root = document.createElement("article");
      this.#root.className = "jd-theme-card";
      this.append(this.#root);
    }
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 */
  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as { theme?: JdThemeBlock; trend?: number[] } | JdThemeBlock;
      if (parsed && "stocks" in parsed) {
        this.#theme = parsed as JdThemeBlock;
      } else if (parsed && typeof parsed === "object") {
        if ((parsed as { theme?: JdThemeBlock }).theme) this.#theme = (parsed as { theme: JdThemeBlock }).theme;
        const t = (parsed as { trend?: number[] }).trend;
        if (Array.isArray(t)) this.#trend = t.filter((n): n is number => Number.isFinite(n));
      }
    } catch {
      /* 잘못된 JSON은 무시 — 렌더를 깨뜨리지 않는다 */
    }
    script.remove();
  }

  protected override update(): void {
    const root = this.#root;
    if (!root) return;
    root.textContent = "";
    const theme = this.#theme;
    if (!theme) return;

    // 헤더 ---------------------------------------------------------------
    const header = el("header", "jd-theme-card__header");
    const heading = el("div", "jd-theme-card__heading");
    const titleRow = el("div", "jd-theme-card__title-row");
    if (theme.starred) {
      const star = el("span", "jd-theme-card__star");
      star.setAttribute("aria-hidden", "true");
      star.textContent = "★";
      titleRow.append(star);
    }
    const name = el("h3", "jd-theme-card__name");
    name.textContent = theme.name;
    titleRow.append(name);
    heading.append(titleRow);
    if (theme.headline) {
      const headline = el("p", "jd-theme-card__headline");
      headline.textContent = theme.headline;
      heading.append(headline);
    }
    const total = el("span", "jd-theme-card__total");
    total.textContent = fmtEok(theme["total억"]);
    header.append(heading, total);
    root.append(header);

    // 스파크라인 ---------------------------------------------------------
    if (this.#trend.length > 1) {
      const chartWrap = el("div", "jd-theme-card__chart");
      chartWrap.append(this.#buildSparkline(this.#trend));
      root.append(chartWrap);
    }

    // 종목 목록 ----------------------------------------------------------
    const list = el("ul", "jd-theme-card__list");
    const stocks = (theme.stocks ?? []).slice(0, 4);
    if (stocks.length === 0) {
      const empty = el("li", "jd-theme-card__empty");
      empty.textContent = "준비 중인 테마입니다";
      list.append(empty);
    } else {
      for (const s of stocks) list.append(this.#buildRow(s));
    }
    root.append(list);
  }

  #buildRow(s: JdThemeStock): HTMLLIElement {
    const li = el("li", "jd-theme-card__item") as HTMLLIElement;
    const a = document.createElement("a");
    a.className = "jd-theme-card__row";
    a.href = `${this.stockHrefBase}${encodeURIComponent(s.name)}`;

    const nameCell = el("span", "jd-theme-card__stock-name");
    if (s.king) {
      const k = el("span", "jd-theme-card__king");
      k.setAttribute("aria-hidden", "true");
      k.textContent = "♛";
      nameCell.append(k);
    }
    if (s.hot) {
      const dot = el("span", "jd-theme-card__hot");
      dot.setAttribute("aria-hidden", "true");
      nameCell.append(dot);
    }
    const label = el("span", "jd-theme-card__stock-label");
    label.textContent = s.name;
    nameCell.append(label);

    const up = s.pct >= 0;
    const numCell = el("span", "jd-theme-card__num");
    const price = el("span", "jd-theme-card__price");
    price.setAttribute("data-dir", up ? "up" : "down");
    price.textContent = s.price.toLocaleString("ko-KR");
    const amount = el("span", "jd-theme-card__amount");
    amount.textContent = fmtEok(s["amount억"]);
    numCell.append(price, amount);

    a.append(nameCell, numCell, this.#buildPct(s.pct, s.hot));
    li.append(a);
    return li;
  }

  #buildPct(pct: number, hot?: boolean): HTMLSpanElement {
    const up = pct >= 0;
    const tag = el("span", "jd-theme-card__pct");
    tag.setAttribute("data-dir", up ? "up" : "down");
    if (hot) {
      tag.setAttribute("data-hot", "");
      const arrow = el("span", "jd-theme-card__pct-arrow");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = up ? "▲" : "▼";
      tag.append(arrow, document.createTextNode(`${Math.abs(pct).toFixed(2)}%`));
    } else {
      tag.textContent = `${up ? "+" : ""}${pct.toFixed(2)}%`;
    }
    return tag;
  }

  /** area 스파크라인 — 좌표 정규화 후 채움+선 (jd-mini-chart 관용구) */
  #buildSparkline(data: number[]): SVGSVGElement {
    const W = 400;
    const H = 32;
    const PAD = 1;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const step = W / (data.length - 1);
    const y = (v: number): number => H - PAD - ((v - min) / span) * (H - PAD * 2);
    const pts = data.map((v, i) => [i * step, y(v)] as const);

    const line = pts.map(([x, yy], i) => `${i === 0 ? "M" : "L"}${num(x)} ${num(yy)}`).join(" ");
    const area = `${line} L${num(W)} ${num(H)} L0 ${num(H)} Z`;

    const svg = svgEl("svg");
    svg.setAttribute("class", "jd-theme-card__spark");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");

    const fill = svgEl("path");
    fill.setAttribute("class", "jd-theme-card__spark-area");
    fill.setAttribute("d", area);
    const stroke = svgEl("path");
    stroke.setAttribute("class", "jd-theme-card__spark-line");
    stroke.setAttribute("d", line);
    svg.append(fill, stroke);
    return svg;
  }
}

function el(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}
