/**
 * <jd-day-detail-drawer> — 영업일 상세 패널 (v2 finance/DayDetailDrawer) = jd-drawer 파생.
 *
 * v2는 fixed 백드롭 + aside를 손으로 짓고 ESC·body 스크롤 락을 useEffect로 다시 구현했다.
 * v3는 그 전부를 jd-drawer(→ jd-modal)가 갖고, 여기서는 **우측 패널 본문만** 얹는다
 * (포커스 감금·요청형 닫기·재연결 복원이 공짜 — v2엔 셋 다 없었다).
 *
 * 일중 캔들·투자자 순매수는 v2처럼 date 해시 시드로 **결정적으로** 생성한다(순수 산술 —
 * Math.random/Date.now 없음, §3.1-3 정합). 데이터는 복합 객체라 property 전용(§1.3).
 *
 * v2 대비 교정:
 *  1. **toLocaleString 제거**(로케일 비결정 — §3.1-3) → 직접 천단위 구분.
 *  2. 캔들/막대 색을 표시 속성이 아니라 CSS 클래스로 — 상승/하락 앱 재틴트 허용.
 *  3. 순매수 부호가 색으로만 전달됐다 → 값 텍스트에 부호 유지.
 */
import { JdDrawer } from "../drawer/element.js";
import { adoptStyles } from "../../core/styles.js";
import dayDetailDrawerStyles from "./day-detail-drawer.css.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const WEEKDAY_KR = ["일", "월", "화", "수", "목", "금", "토"];

export interface JdDayLeader {
  name: string;
  close: number;
  pct: number;
}

export interface JdDayEntry {
  /** ISO 날짜 "YYYY-MM-DD" */
  date: string;
  /** 0=일 … 6=토 */
  weekday: number;
  isToday?: boolean;
  kospiClose: number;
  /** 코스피 변동 % */
  kospiChangePct: number;
  /** 평가금액(원) */
  portfolio: number;
  /** 거래대금 변동 % */
  volumeChangePct: number;
  themes: string[];
  leaders?: JdDayLeader[];
}

interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}
interface Flow {
  foreign: number;
  institution: number;
  individual: number;
}

function group(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const neg = n < 0;
  const [int = "0", frac] = Math.abs(Math.round(n)).toString().split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
}

function fmtMoney(won: number): string {
  if (won >= 100_000_000) return `${(won / 100_000_000).toFixed(2)}억`;
  if (won >= 10_000) return `${group(Math.round(won / 10_000))}만`;
  return group(won);
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

function generateIntradayCandles(seed: number, opens: number, pct: number, n = 30): Candle[] {
  const out: Candle[] = [];
  let cur = opens;
  const target = opens * (1 + pct / 100);
  for (let i = 0; i < n; i++) {
    const r = ((seed * (i + 3)) % 1000) / 1000 - 0.5;
    const drift = (target - cur) / Math.max(1, n - i);
    const o = cur;
    const c = +(cur + drift + r * opens * 0.004).toFixed(2);
    const h = Math.max(o, c) + Math.abs(r) * opens * 0.003;
    const l = Math.min(o, c) - Math.abs(r) * opens * 0.003;
    out.push({ o, h, l, c });
    cur = c;
  }
  return out;
}

function intradayInvestorFlow(seed: number, n = 30): Flow[] {
  const out: Flow[] = [];
  for (let i = 0; i < n; i++) {
    const r1 = ((seed * (i + 5)) % 1000) / 1000 - 0.5;
    const r2 = ((seed * (i + 7)) % 1000) / 1000 - 0.5;
    const r3 = ((seed * (i + 11)) % 1000) / 1000 - 0.5;
    const f = Math.round(r1 * 800);
    const inst = Math.round(r2 * 600);
    const ind = -(f + inst) + Math.round(r3 * 200);
    out.push({ foreign: f, institution: inst, individual: ind });
  }
  return out;
}

function svg<K extends keyof SVGElementTagNameMap>(name: K, cls?: string): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, name);
  if (cls) el.setAttribute("class", cls);
  return el;
}

function elc(tag: string, className: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export class JdDayDetailDrawer extends JdDrawer {
  static override tag = "jd-day-detail-drawer";
  static override props = {
    ...JdDrawer.props,
    // side/title은 JdDrawer에서 상속 — 기본 right, title은 update가 채운다
  };

  #entry: JdDayEntry | null = null;
  #content: HTMLElement | null = null;
  #painted: JdDayEntry | null | undefined = undefined;

  get entry(): JdDayEntry | null {
    return this.#entry;
  }
  set entry(v: JdDayEntry | null) {
    this.#entry = v && typeof v === "object" ? v : null;
    // title은 setter에서 계산·대입한다 — update() 안에서 반응형 프로퍼티를 쓰면
    // requestUpdate 재귀 루프에 빠진다(base setter는 동등성 가드가 없다).
    this.title = this.#entry ? this.#titleText(this.#entry) : "";
    this.requestUpdate();
  }

  protected override render(): void {
    // 업그레이드 전 대입된 entry own 프로퍼티 회수(accessor 전용 표면 — chart upgradeAccessor 동형)
    if (Object.prototype.hasOwnProperty.call(this, "entry")) {
      const v = (this as { entry?: JdDayEntry | null }).entry;
      delete (this as { entry?: JdDayEntry | null }).entry;
      this.entry = v ?? null;
    }
    super.render(); // 드로어 헤더(제목+닫기) + 패널 구축
    adoptStyles(dayDetailDrawerStyles);
    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (panel) {
      this.#content = panel.querySelector(":scope > .jd-day-detail__content");
      if (!this.#content) {
        this.#content = elc("div", "jd-day-detail__content");
        panel.append(this.#content);
      }
    }
    this.update();
  }

  #titleText(e: JdDayEntry): string {
    const [y = "", m = "", d = ""] = e.date.split("-");
    const wd = WEEKDAY_KR[e.weekday] ?? "";
    return `${y}.${m.padStart(2, "0")}.${d.padStart(2, "0")} (${wd})`;
  }

  protected override update(): void {
    super.update(); // 드로어 제목·헤더 반영
    if (!this.#content) return;
    const e = this.#entry;
    this.#content.hidden = !e;
    // entry가 바뀔 때만 본문을 다시 짓는다 — open 토글 등 다른 상태 변화에는 손대지 않는다
    if (e === this.#painted) return;
    this.#painted = e;
    if (!e) {
      this.#content.textContent = "";
      return;
    }
    this.#content.textContent = "";
    this.#content.append(
      this.#meta(e),
      this.#stats(e),
      ...(e.themes.length ? [this.#themes(e)] : []),
      this.#candleSection(e),
      this.#flowSection(e),
      ...(e.leaders?.length ? [this.#leaders(e)] : []),
    );
  }

  #meta(e: JdDayEntry): HTMLElement {
    const [, m = "", d = ""] = e.date.split("-");
    const meta = elc("div", "jd-day-detail__meta");
    const pill = elc("span", "jd-day-detail__pill", `${Number(m)}/${Number(d)}`);
    pill.toggleAttribute("data-today", Boolean(e.isToday));
    meta.append(pill, elc("span", "jd-day-detail__meta-sub", e.isToday ? "오늘" : "영업일 상세"));
    return meta;
  }

  #stats(e: JdDayEntry): HTMLElement {
    const grid = elc("div", "jd-day-detail__stats");
    grid.append(
      statTile(
        "코스피 종가",
        group(e.kospiClose),
        `${e.kospiChangePct >= 0 ? "+" : ""}${e.kospiChangePct.toFixed(2)}%`,
        e.kospiChangePct >= 0 ? "up" : "down",
      ),
      statTile("평가금액", fmtMoney(e.portfolio), `${group(e.portfolio)}원`),
      statTile(
        "거래대금 변동",
        `${e.volumeChangePct >= 0 ? "+" : ""}${e.volumeChangePct.toFixed(2)}%`,
        undefined,
        e.volumeChangePct >= 0 ? "up" : "down",
      ),
      statTile("당일 주도 테마", e.themes[0] ?? "—", e.themes.slice(1, 3).join(" · ") || undefined),
    );
    return grid;
  }

  #themes(e: JdDayEntry): HTMLElement {
    const section = sectionEl("테마");
    const chips = elc("div", "jd-day-detail__theme-chips");
    for (const t of e.themes) chips.append(elc("span", "jd-day-detail__theme", t));
    section.append(chips);
    return section;
  }

  #candleSection(e: JdDayEntry): HTMLElement {
    const section = sectionEl("코스피 일중 흐름");
    const seed = hashSeed(e.date);
    const opens = e.kospiClose / (1 + e.kospiChangePct / 100);
    const candles = generateIntradayCandles(seed, opens, e.kospiChangePct, 30);
    section.append(this.#candleChart(candles));
    return section;
  }

  #candleChart(candles: Candle[]): SVGSVGElement {
    const w = 432;
    const h = 140;
    const pad = 6;
    const s = svg("svg", "jd-day-detail__chart");
    s.setAttribute("viewBox", `0 0 ${w} ${h}`);
    s.setAttribute("width", "100%");
    s.setAttribute("height", String(h));
    s.setAttribute("aria-hidden", "true");
    if (candles.length === 0) return s;
    const slot = (w - pad * 2) / candles.length;
    const lo = Math.min(...candles.map((c) => c.l));
    const hi = Math.max(...candles.map((c) => c.h));
    const range = hi - lo || 1;
    const yOf = (v: number): number => round(pad + ((hi - v) / range) * (h - pad * 2));
    candles.forEach((c, i) => {
      const cx = round(pad + slot * (i + 0.5));
      const up = c.c >= c.o;
      const cls = up ? "jd-day-detail__candle--up" : "jd-day-detail__candle--down";
      const wick = svg("line", `jd-day-detail__candle ${cls}`);
      wick.setAttribute("x1", String(cx));
      wick.setAttribute("x2", String(cx));
      wick.setAttribute("y1", String(yOf(c.h)));
      wick.setAttribute("y2", String(yOf(c.l)));
      const top = yOf(Math.max(c.o, c.c));
      const bottom = yOf(Math.min(c.o, c.c));
      const body = svg("rect", `jd-day-detail__candle-body ${cls}`);
      body.setAttribute("x", String(round(cx - slot * 0.32)));
      body.setAttribute("y", String(top));
      body.setAttribute("width", String(round(slot * 0.64)));
      body.setAttribute("height", String(Math.max(1, round(bottom - top))));
      s.append(wick, body);
    });
    return s;
  }

  #flowSection(e: JdDayEntry): HTMLElement {
    const section = sectionEl("투자자별 순매수 (당일 누적)");
    const seed = hashSeed(e.date);
    const flow = intradayInvestorFlow(seed, 30);
    const totalForeign = flow.reduce((s, f) => s + f.foreign, 0);
    const totalInst = flow.reduce((s, f) => s + f.institution, 0);
    const totalInd = flow.reduce((s, f) => s + f.individual, 0);
    const cards = elc("div", "jd-day-detail__nets");
    cards.append(
      netCard("외국인", totalForeign, "foreign"),
      netCard("기관", totalInst, "institution"),
      netCard("개인", totalInd, "individual"),
    );
    section.append(cards, this.#flowChart(flow));
    return section;
  }

  #flowChart(flow: Flow[]): SVGSVGElement {
    const w = 432;
    const h = 100;
    const pad = 6;
    const s = svg("svg", "jd-day-detail__chart");
    s.setAttribute("viewBox", `0 0 ${w} ${h}`);
    s.setAttribute("width", "100%");
    s.setAttribute("height", String(h));
    s.setAttribute("aria-hidden", "true");
    if (flow.length === 0) return s;
    const slot = (w - pad * 2) / flow.length;
    const all = flow.flatMap((f) => [f.foreign, f.institution, f.individual]);
    const lo = Math.min(0, ...all);
    const hi = Math.max(0, ...all);
    const range = hi - lo || 1;
    const yOf = (v: number): number => round(pad + ((hi - v) / range) * (h - pad * 2));
    const barW = (slot * 0.78) / 3;
    const zero = yOf(0);
    const axis = svg("line", "jd-day-detail__flow-axis");
    axis.setAttribute("x1", String(pad));
    axis.setAttribute("x2", String(w - pad));
    axis.setAttribute("y1", String(zero));
    axis.setAttribute("y2", String(zero));
    s.append(axis);
    const series: (keyof Flow)[] = ["foreign", "institution", "individual"];
    const offset = [-1.55, -0.5, 0.55];
    flow.forEach((f, i) => {
      const cx = pad + slot * (i + 0.5);
      series.forEach((k, si) => {
        const v = f[k];
        const y = yOf(v);
        const bar = svg("rect", `jd-day-detail__flow-bar jd-day-detail__flow-bar--${k}`);
        bar.setAttribute("x", String(round(cx + barW * offset[si]!)));
        bar.setAttribute("y", String(round(Math.min(zero, y))));
        bar.setAttribute("width", String(round(barW)));
        bar.setAttribute("height", String(Math.max(1, round(Math.abs(y - zero)))));
        bar.setAttribute("rx", "1.5");
        bar.toggleAttribute("data-neg", v < 0);
        s.append(bar);
      });
    });
    return s;
  }

  #leaders(e: JdDayEntry): HTMLElement {
    const section = sectionEl("왕관 종목");
    const list = elc("ul", "jd-day-detail__leaders");
    const leaders = e.leaders ?? [];
    leaders.forEach((l, i) => {
      const up = l.pct >= 0;
      const li = elc("li", "jd-day-detail__leader");
      li.toggleAttribute("data-alt", i % 2 !== 0);
      li.append(
        elc("span", "jd-day-detail__leader-crown", "♛"),
        elc("span", "jd-day-detail__leader-name", l.name),
      );
      const right = elc("div", "jd-day-detail__leader-right");
      right.append(
        elc("span", "jd-day-detail__leader-close", group(l.close)),
        (() => {
          const p = elc(
            "span",
            "jd-day-detail__leader-pct",
            `${up ? "+" : ""}${l.pct.toFixed(2)}%`,
          );
          p.dataset.dir = up ? "up" : "down";
          return p;
        })(),
      );
      li.append(right);
      list.append(li);
    });
    section.append(list);
    return section;
  }
}

function round(v: number): number {
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;
}

function sectionEl(title: string): HTMLElement {
  const section = elc("section", "jd-day-detail__section");
  section.append(elc("div", "jd-day-detail__section-title", title));
  return section;
}

function statTile(label: string, value: string, sub?: string, tone?: "up" | "down"): HTMLElement {
  const tile = elc("div", "jd-day-detail__stat");
  tile.append(elc("div", "jd-day-detail__stat-label", label));
  const v = elc("div", "jd-day-detail__stat-value", value);
  if (tone) v.dataset.dir = tone;
  tile.append(v);
  if (sub) {
    const s = elc("div", "jd-day-detail__stat-sub", sub);
    if (tone) s.dataset.dir = tone;
    tile.append(s);
  }
  return tile;
}

function netCard(label: string, value: number, series: keyof Flow): HTMLElement {
  const up = value >= 0;
  const card = elc("div", "jd-day-detail__net");
  const head = elc("span", "jd-day-detail__net-label");
  const dot = elc("span", `jd-day-detail__net-dot jd-day-detail__net-dot--${series}`);
  dot.setAttribute("aria-hidden", "true");
  head.append(dot, document.createTextNode(label));
  const val = elc("span", "jd-day-detail__net-value", `${up ? "+" : ""}${group(value)}억`);
  val.dataset.dir = up ? "up" : "down";
  card.append(head, val);
  return card;
}
