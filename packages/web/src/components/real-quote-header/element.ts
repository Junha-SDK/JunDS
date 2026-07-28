/**
 * <jd-real-quote-header> — 실시간 시세 헤더 카드 (v2 finance/RealQuoteHeader).
 *
 * DEC-003: v2는 `/api/quote`를 **가져와서** 그렸다. v3는 시세를 property `data`로
 * **받아** 그린다 — fetch·로딩·소스 판정은 호출부(앱)가 하고, 컴포넌트는 표시만 한다.
 * data가 없으면 호스트를 hidden(v2의 `if (loading || !data) return null` 등가).
 *
 * v2 대비 교정:
 *  - **toLocaleString("ko-KR")**가 시세 숫자에 박혀 프리렌더/방문자 로케일이 갈렸다 →
 *    groupDigits(§3.1-3). 거래량·시총 축약(fmtVolume/fmtCap)은 로케일 무관이라 유지.
 *  - 색이 인라인 style이었다 → data-tone(up/down) + finance 토큰(상승=적/하락=청).
 *  - h2가 문서에 그냥 있어 heading 레벨 겹침 위험 → aria로 시세 그룹을 region로 명명.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { groupDigits } from "../../core/chart.js";
import realQuoteHeaderStyles from "./real-quote-header.css.js";

export interface JdQuoteData {
  source: "kis" | "yahoo" | "mock";
  name?: string;
  price: number;
  change: number;
  changePct: number;
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  volume?: number;
  marketCap?: number;
  high52?: number;
  low52?: number;
  per?: number;
  pbr?: number;
}

type Tone = "up" | "down" | "none";

const ACTIVITY_SVG =
  `<svg class="jd-real-quote-header__icon" width="16" height="16" viewBox="0 0 24 24" ` +
  `fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ` +
  `stroke-linejoin="round" aria-hidden="true">` +
  `<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>`;

/** v2 fmtVolume — 로케일 무관 축약(B/M/K) */
function fmtVolume(v?: number): string {
  if (!v) return "—";
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return groupDigits(v);
}

/** v2 fmtCap — 억/조 축약 */
function fmtCap(v?: number): string {
  if (!v) return "—";
  const eok = v / 100_000_000;
  if (eok >= 10_000) return `${(eok / 10_000).toFixed(2)}조`;
  if (eok >= 1) return `${eok.toFixed(0)}억`;
  return groupDigits(v);
}

const grpOrDash = (v?: number): string =>
  typeof v === "number" && Number.isFinite(v) ? groupDigits(v) : "—";

interface KvRef {
  value: HTMLElement;
  unit: HTMLElement;
}

const KV_KEYS = ["price", "change", "volume", "cap"] as const;
const KV_LABELS: Record<(typeof KV_KEYS)[number], string> = {
  price: "현재가",
  change: "전일대비",
  volume: "거래량",
  cap: "시가총액",
};
const MINI_KEYS = ["open", "high", "low", "prevClose", "high52", "low52"] as const;
const MINI_LABELS: Record<(typeof MINI_KEYS)[number], string> = {
  open: "시가",
  high: "고가",
  low: "저가",
  prevClose: "전일종가",
  high52: "52주 최고",
  low52: "52주 최저",
};

export class JdRealQuoteHeader extends JdElement {
  static override tag = "jd-real-quote-header";
  static override props = {
    heading: { type: String, default: "실시간 시세" },
  };

  declare heading: string;

  #data: JdQuoteData | null = null;

  #headingEl!: HTMLElement;
  #sourceEl!: HTMLElement;
  #delayEl!: HTMLElement;
  #kv: Record<string, KvRef> = {};
  #mini: Record<string, HTMLElement> = {};
  #ratioRow!: HTMLElement;
  #per!: HTMLElement;
  #pbr!: HTMLElement;

  /** 시세 데이터 — property 전용(§1.3). null이면 숨김 */
  get data(): JdQuoteData | null {
    return this.#data;
  }
  set data(v: JdQuoteData | null) {
    this.#data = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(realQuoteHeaderStyles);
    if (Object.prototype.hasOwnProperty.call(this, "data")) {
      const v = (this as Record<string, unknown>).data;
      delete (this as Record<string, unknown>).data;
      (this as Record<string, unknown>).data = v;
    }
    if (!this.querySelector(":scope > .jd-real-quote-header__header")) this.#build();
    else this.#collect();
    if (!this.hasAttribute("role")) this.setAttribute("role", "region");
    this.update();
  }

  #build(): void {
    // 헤더
    const header = document.createElement("header");
    header.className = "jd-real-quote-header__header";
    const title = document.createElement("div");
    title.className = "jd-real-quote-header__titlebar";
    title.insertAdjacentHTML("beforeend", ACTIVITY_SVG);
    this.#headingEl = document.createElement("h2");
    this.#headingEl.className = "jd-real-quote-header__heading";
    this.#sourceEl = document.createElement("span");
    this.#sourceEl.className = "jd-real-quote-header__source";
    this.#sourceEl.hidden = true;
    title.append(this.#headingEl, this.#sourceEl);
    this.#delayEl = document.createElement("span");
    this.#delayEl.className = "jd-real-quote-header__delay";
    header.append(title, this.#delayEl);

    // 대표 지표 4칸
    const kv = document.createElement("div");
    kv.className = "jd-real-quote-header__kv";
    for (const key of KV_KEYS) {
      const cell = document.createElement("div");
      cell.className = "jd-real-quote-header__kv-cell";
      const label = document.createElement("div");
      label.className = "jd-real-quote-header__kv-label";
      label.textContent = KV_LABELS[key];
      const value = document.createElement("div");
      value.className = "jd-real-quote-header__kv-value";
      if (key === "price" || key === "change") value.dataset.large = "";
      const unit = document.createElement("span");
      unit.className = "jd-real-quote-header__kv-unit";
      value.append(document.createTextNode(""), unit);
      cell.append(label, value);
      kv.append(cell);
      this.#kv[key] = { value, unit };
    }

    // 보조 지표 6칸
    const mini = document.createElement("div");
    mini.className = "jd-real-quote-header__mini";
    for (const key of MINI_KEYS) {
      const cell = document.createElement("div");
      cell.className = "jd-real-quote-header__mini-cell";
      const label = document.createElement("span");
      label.className = "jd-real-quote-header__mini-label";
      label.textContent = MINI_LABELS[key];
      const value = document.createElement("span");
      value.className = "jd-real-quote-header__mini-value";
      cell.append(label, value);
      mini.append(cell);
      this.#mini[key] = value;
    }

    // PER / PBR
    this.#ratioRow = document.createElement("div");
    this.#ratioRow.className = "jd-real-quote-header__ratio";
    this.#per = this.#ratioCell("PER");
    this.#pbr = this.#ratioCell("PBR");
    this.#ratioRow.append(this.#per.parentElement!, this.#pbr.parentElement!);

    this.append(header, kv, mini, this.#ratioRow);
  }

  #ratioCell(label: string): HTMLElement {
    const cell = document.createElement("div");
    cell.className = "jd-real-quote-header__mini-cell";
    const l = document.createElement("span");
    l.className = "jd-real-quote-header__mini-label";
    l.textContent = label;
    const v = document.createElement("span");
    v.className = "jd-real-quote-header__mini-value";
    cell.append(l, v);
    return v;
  }

  /** 입양 경로(§3.3) — 프리렌더/어댑터 골격 재수집 */
  #collect(): void {
    this.#headingEl = this.querySelector(".jd-real-quote-header__heading")!;
    this.#sourceEl = this.querySelector(".jd-real-quote-header__source")!;
    this.#delayEl = this.querySelector(".jd-real-quote-header__delay")!;
    const kvCells = this.querySelectorAll(
      ".jd-real-quote-header__kv .jd-real-quote-header__kv-value",
    );
    KV_KEYS.forEach((key, i) => {
      const value = kvCells[i] as HTMLElement;
      this.#kv[key] = {
        value,
        unit: value.querySelector(".jd-real-quote-header__kv-unit")!,
      };
    });
    const miniCells = this.querySelectorAll(
      ".jd-real-quote-header__mini .jd-real-quote-header__mini-value",
    );
    MINI_KEYS.forEach((key, i) => {
      this.#mini[key] = miniCells[i] as HTMLElement;
    });
    this.#ratioRow = this.querySelector(".jd-real-quote-header__ratio")!;
    const ratioVals = this.#ratioRow.querySelectorAll(".jd-real-quote-header__mini-value");
    this.#per = ratioVals[0] as HTMLElement;
    this.#pbr = ratioVals[1] as HTMLElement;
  }

  protected override update(): void {
    const d = this.#data;
    this.hidden = !d;
    this.#headingEl.textContent = this.heading;
    this.setAttribute("aria-label", d?.name ? `${d.name} ${this.heading}` : this.heading);
    if (!d) return;

    const up = d.changePct >= 0;
    const tone: Tone = up ? "up" : "down";

    // 소스 배지
    if (d.source === "kis") {
      this.#sourceEl.hidden = false;
      this.#sourceEl.dataset.source = "kis";
      this.#sourceEl.textContent = "KIS · 실시간";
      this.#sourceEl.title = "한국투자증권 KIS Open API";
    } else if (d.source === "yahoo") {
      this.#sourceEl.hidden = false;
      this.#sourceEl.dataset.source = "yahoo";
      this.#sourceEl.textContent = "Yahoo · 백업";
      this.#sourceEl.title = "KIS 응답 실패 — Yahoo Finance 백업 사용";
    } else {
      this.#sourceEl.hidden = true;
      delete this.#sourceEl.dataset.source;
      this.#sourceEl.removeAttribute("title");
    }
    this.#delayEl.textContent = d.source === "kis" ? "약 15분 지연" : "15분 지연";

    // KV
    this.#setKv("price", groupDigits(Math.round(d.price)), "원", tone);
    this.#setKv(
      "change",
      `${up ? "+" : ""}${groupDigits(Math.round(d.change))}`,
      `${up ? "+" : ""}${d.changePct.toFixed(2)}%`,
      tone,
    );
    this.#setKv("volume", fmtVolume(d.volume), "주", "none");
    this.#setKv("cap", fmtCap(d.marketCap), "", "none");

    // Mini
    this.#setMini("open", grpOrDash(d.open), "none");
    this.#setMini("high", grpOrDash(d.high), "up");
    this.#setMini("low", grpOrDash(d.low), "down");
    this.#setMini("prevClose", grpOrDash(d.prevClose), "none");
    this.#setMini("high52", grpOrDash(d.high52), "up");
    this.#setMini("low52", grpOrDash(d.low52), "down");

    // PER / PBR
    const hasRatio = d.per != null || d.pbr != null;
    this.#ratioRow.hidden = !hasRatio;
    if (hasRatio) {
      this.#per.textContent = d.per != null ? d.per.toFixed(1) : "—";
      this.#pbr.textContent = d.pbr != null ? d.pbr.toFixed(2) : "—";
    }
  }

  #setKv(key: string, value: string, unit: string, tone: Tone): void {
    const ref = this.#kv[key];
    if (!ref) return;
    ref.value.firstChild!.textContent = value;
    ref.unit.textContent = unit;
    ref.unit.hidden = !unit;
    this.#tone(ref.value, tone);
  }

  #setMini(key: string, value: string, tone: Tone): void {
    const el = this.#mini[key];
    if (!el) return;
    el.textContent = value;
    this.#tone(el, tone);
  }

  #tone(el: HTMLElement, tone: Tone): void {
    if (tone === "none") delete el.dataset.tone;
    else el.dataset.tone = tone;
  }
}
