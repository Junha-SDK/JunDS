/**
 * <jd-fzone-card> — 종목 F존(매수 후보 구간) 카드 (v2 finance/FZoneCard).
 *
 * 데이터는 복합 객체라 property 전용(§1.3) — `el.card = {...}` 또는 자식 JSON 슬롯.
 * 라이브 가격 overlay(useLivePrice)는 데이터 층 관심사(DEC-003)라 걷어내고, 컴포넌트는
 * 받은 card 값으로 상태(B1/B2/B3 임박)를 **결정적으로** 재산출한다(순수 계산 — §3.1-3 정합).
 *
 * v2 대비 교정:
 *  1. **카드 전체가 링크인데 접근 이름이 없었다** → `<a>`에 "{종목} 상세" aria-label.
 *  2. **toLocaleString 제거**(로케일 비결정 — §3.1-3) → 직접 천단위 구분.
 *  3. 상태 pill 색은 상승색 폴백 체인(--jd-finance-up)으로 앱 재틴트 허용.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import fzoneCardStyles from "./fzone-card.css.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export type JdZoneKind = "F" | "SF" | "G" | "J";
export type JdZoneMarker = "high" | "mid" | "low";

export interface JdFzoneCardData {
  name: string;
  kind?: JdZoneKind;
  price: number;
  pct: number;
  /** 시가총액(조) */
  cap: number;
  /** 거래대금(억) */
  amount: number;
  resistance: number;
  b1: number;
  b2: number;
  b3: number;
  marker?: JdZoneMarker;
}

const LEVEL_PREFIX: Record<JdZoneKind, string> = { F: "B", SF: "SF", G: "G", J: "J" };

function group(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const neg = n < 0;
  const [int = "0", frac] = Math.abs(n).toString().split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
}

function svg<K extends keyof SVGElementTagNameMap>(name: K, cls?: string): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, name);
  if (cls) el.setAttribute("class", cls);
  return el;
}

export class JdFzoneCard extends JdElement {
  static override tag = "jd-fzone-card";
  static override props = {
    /** 링크 대상. 비우면 name으로 /stock/{name} 파생 */
    href: { type: String },
    /** 링크 기본 경로 — href 미지정 시 접두 */
    hrefBase: { type: String, default: "/stock/" },
  };

  declare href: string;
  declare hrefBase: string;

  #card: JdFzoneCardData | null = null;
  #link!: HTMLAnchorElement;
  #name!: HTMLElement;
  #status!: HTMLElement;
  #price!: HTMLElement;
  #cap!: HTMLElement;
  #pct!: HTMLElement;
  #amount!: HTMLElement;
  #levels!: HTMLElement;
  #markerCol!: SVGSVGElement;

  get card(): JdFzoneCardData | null {
    return this.#card;
  }
  set card(v: JdFzoneCardData | null) {
    this.#card = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(fzoneCardStyles);
    if (!this.#card) {
      const script = this.querySelector<HTMLScriptElement>(
        ':scope > script[type="application/json"]',
      );
      if (script) {
        try {
          const parsed = JSON.parse(script.textContent || "null");
          if (parsed && typeof parsed === "object") this.#card = parsed as JdFzoneCardData;
        } catch {
          /* 무시 */
        }
        script.remove();
      }
    }
    this.#build();
    this.update();
  }

  #build(): void {
    this.#link = document.createElement("a");
    this.#link.className = "jd-fzone-card__link";

    const header = document.createElement("header");
    header.className = "jd-fzone-card__header";
    this.#name = document.createElement("span");
    this.#name.className = "jd-fzone-card__name";
    this.#status = document.createElement("span");
    this.#status.className = "jd-fzone-card__status";
    header.append(this.#name, this.#status);

    const body = document.createElement("div");
    body.className = "jd-fzone-card__body";
    const info = document.createElement("div");
    info.className = "jd-fzone-card__info";

    info.append(
      row("현재가", (this.#price = valueSpan("jd-fzone-card__price"))),
      row("", (this.#cap = document.createElement("span")), (this.#pct = valueSpan("jd-fzone-card__pct"))),
      row("", (this.#amount = document.createElement("span"))),
    );
    this.#cap.className = "jd-fzone-card__meta";
    this.#amount.className = "jd-fzone-card__meta";

    this.#levels = document.createElement("div");
    this.#levels.className = "jd-fzone-card__levels";
    info.append(this.#levels);

    this.#markerCol = svg("svg", "jd-fzone-card__marker");
    this.#markerCol.setAttribute("viewBox", "0 0 18 108");
    this.#markerCol.setAttribute("width", "18");
    this.#markerCol.setAttribute("height", "108");
    this.#markerCol.setAttribute("aria-hidden", "true");

    body.append(info, this.#markerCol);
    this.#link.append(header, body);
    this.append(this.#link);
  }

  #resolveHref(name: string): string {
    if (this.href) return this.href;
    if (!name) return "#";
    return `${this.hrefBase}${encodeURIComponent(name)}`;
  }

  /** v2 liveStatus — 현재가가 어느 매수 구간에 있는지 결정적으로 판정 */
  #status4(c: JdFzoneCardData, prefix: string): string {
    const l1 = `${prefix}1`;
    const l2 = `${prefix}2`;
    const l3 = `${prefix}3`;
    if (c.price <= c.b3 + (c.b2 - c.b3) * 0.2) return l3;
    if (c.price <= c.b2 + (c.b1 - c.b2) * 0.2) return l2;
    if (c.price <= c.b1 + (c.resistance - c.b1) * 0.2) return l1;
    return `${prefix}존임박`;
  }

  protected override update(): void {
    const c = this.#card;
    this.#link.hidden = !c;
    if (!c) return;
    const kind: JdZoneKind = c.kind ?? "F";
    const prefix = LEVEL_PREFIX[kind];
    const status = this.#status4(c, prefix);

    this.#link.href = this.#resolveHref(c.name);
    this.#link.setAttribute("aria-label", `${c.name} 상세 · 상태 ${status}`);

    const header = this.#link.querySelector<HTMLElement>(".jd-fzone-card__header")!;
    header.dataset.kind = kind;
    this.#name.textContent = c.name;
    this.#status.textContent = status;

    const up = c.pct > 0;
    this.#price.textContent = group(c.price);
    this.#price.dataset.dir = up ? "up" : "down";
    this.#cap.textContent = `시총 ${group(c.cap)}조`;
    this.#pct.textContent = `${up ? "+" : ""}${c.pct.toFixed(2)}%`;
    this.#pct.dataset.dir = up ? "up" : "down";
    this.#amount.textContent = `대금 ${group(c.amount)}억`;

    this.#renderLevels(c, prefix, status);
    this.#renderMarker(c.marker ?? "mid");
  }

  #renderLevels(c: JdFzoneCardData, prefix: string, status: string): void {
    const rows: { label: string; value: number; muted?: boolean; highlight?: boolean }[] = [
      { label: "저항선", value: c.resistance, muted: true },
      { label: `${prefix}1`, value: c.b1, highlight: status === `${prefix}1` },
      { label: `${prefix}2`, value: c.b2, highlight: status === `${prefix}2` },
      { label: `${prefix}3`, value: c.b3, highlight: status === `${prefix}3` },
    ];
    if (this.#levels.children.length !== rows.length) {
      this.#levels.textContent = "";
      for (let i = 0; i < rows.length; i++) {
        const r = document.createElement("div");
        r.className = "jd-fzone-card__level";
        const lb = document.createElement("span");
        lb.className = "jd-fzone-card__level-label";
        const vl = document.createElement("span");
        vl.className = "jd-fzone-card__level-value";
        r.append(lb, vl);
        this.#levels.append(r);
      }
    }
    rows.forEach((r, i) => {
      const row = this.#levels.children[i] as HTMLElement;
      row.toggleAttribute("data-muted", Boolean(r.muted));
      row.toggleAttribute("data-highlight", Boolean(r.highlight));
      row.querySelector(".jd-fzone-card__level-label")!.textContent = r.label;
      row.querySelector(".jd-fzone-card__level-value")!.textContent = group(r.value);
    });
  }

  #renderMarker(marker: JdZoneMarker): void {
    this.#markerCol.textContent = "";
    const guide = svg("line");
    guide.setAttribute("x1", "9");
    guide.setAttribute("x2", "9");
    guide.setAttribute("y1", "2");
    guide.setAttribute("y2", "106");
    guide.setAttribute("class", "jd-fzone-card__marker-guide");
    this.#markerCol.append(guide);
    const segs: { y: number; h: number; on: boolean; dir: "up" | "down" }[] = [
      { y: 4, h: 20, on: marker === "high", dir: "up" },
      { y: 42, h: 28, on: marker === "mid", dir: "down" },
      { y: 84, h: 20, on: marker === "low", dir: "down" },
    ];
    for (const s of segs) {
      const rect = svg("rect", "jd-fzone-card__marker-seg");
      rect.setAttribute("x", "5");
      rect.setAttribute("y", String(s.y));
      rect.setAttribute("width", "8");
      rect.setAttribute("height", String(s.h));
      rect.setAttribute("rx", "2");
      rect.toggleAttribute("data-on", s.on);
      if (s.on) rect.dataset.dir = s.dir;
      this.#markerCol.append(rect);
    }
  }
}

function row(label: string, ...values: HTMLElement[]): HTMLElement {
  const r = document.createElement("div");
  r.className = "jd-fzone-card__row";
  if (label) {
    const lb = document.createElement("span");
    lb.className = "jd-fzone-card__row-label";
    lb.textContent = label;
    r.append(lb);
  }
  r.append(...values);
  return r;
}

function valueSpan(cls: string): HTMLElement {
  const s = document.createElement("span");
  s.className = cls;
  return s;
}
