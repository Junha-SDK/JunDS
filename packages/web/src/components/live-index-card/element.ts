/**
 * <jd-live-index-card> — 지수 카드 (v2 finance/LiveIndexCard).
 *
 * v2는 컴포넌트가 직접 `/api/kis/index` REST 폴링 + SSE tick(useLiveIndex)으로
 * 값을 가져와 fallback 위에 덮어썼다. DS 컴포넌트는 데이터 연동을 앱(@junds/finance-data)에
 * 남기고 **표시 전용 카드**로 둔다(DEC-003 코어 런타임 데이터 의존 0): 앱이 계산한
 * value/change/change-pct 를 프로퍼티(또는 attribute)로 싣고, KIS 소스 문구는 `source`로 준다.
 *
 * v2 대비 개선:
 *  - 등락 방향은 host `data-dir`로 반영 → 색은 전부 CSS(§4.3), update()에 색 분기 없음.
 *  - ▲/▼ 글리프는 aria-hidden, 등락률에 aria-label("등락률 +1.23%")을 부여해 AT에도 수치를 싣는다.
 *  - 큰 지수 값은 본문색 고정(v2 주석 승계) — 등락 착색은 diff/pct 라인만(가격색 도배 방지).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { svgNode } from "../../core/chart.js";
import liveIndexCardStyles from "./live-index-card.css.js";

const NF = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

export class JdLiveIndexCard extends JdElement {
  static override tag = "jd-live-index-card";
  static override props = {
    /** "KOSPI" | "KOSDAQ" | "KOSPI200" — 식별용(표시엔 label 사용) */
    code: { type: String },
    label: { type: String, default: "" },
    value: { type: Number },
    /** 전일 대비 (포인트) */
    change: { type: Number },
    /** 전일 대비 (%) */
    changePct: { type: Number },
    /** 큰 카드 변형 */
    large: { type: Boolean, reflect: true },
    /** 시세 출처 툴팁 (예: "KIS 소켓 · 15:30:02") */
    source: { type: String },
    // spark(number[])는 복합 데이터 — property 전용(§1.3).
  };

  declare code: string;
  declare label: string;
  declare value: number;
  declare change: number;
  declare changePct: number;
  declare large: boolean;
  declare source: string;

  #spark: number[] = [];
  #head!: HTMLElement;
  #label!: HTMLElement;
  #pct!: HTMLElement;
  #value!: HTMLElement;
  #diff!: HTMLElement;
  #body!: HTMLElement;
  #sparkEl: SVGSVGElement | null = null;

  get spark(): number[] {
    return this.#spark;
  }
  set spark(v: number[]) {
    this.#spark = Array.isArray(v) ? v.map(Number).filter(Number.isFinite) : [];
    if (this.#body) this.#renderSpark();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(liveIndexCardStyles);
    this.setAttribute("role", "group");

    // 선언적 초기화 슬롯 — spark 배열 1회 소비
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (script?.textContent) {
      try {
        const parsed = JSON.parse(script.textContent) as number[];
        if (Array.isArray(parsed)) this.#spark = parsed.map(Number).filter(Number.isFinite);
      } catch {
        /* 무시 */
      }
      script.remove();
    }

    this.#head = document.createElement("header");
    this.#head.className = "jd-live-index-card__head";
    this.#label = document.createElement("span");
    this.#label.className = "jd-live-index-card__label";
    this.#pct = document.createElement("span");
    this.#pct.className = "jd-live-index-card__pct";
    this.#head.append(this.#label, this.#pct);

    this.#body = document.createElement("div");
    this.#body.className = "jd-live-index-card__body";
    this.#value = document.createElement("div");
    this.#value.className = "jd-live-index-card__value";
    this.#diff = document.createElement("div");
    this.#diff.className = "jd-live-index-card__diff";
    this.#body.append(this.#value, this.#diff);

    this.append(this.#head, this.#body);
    this.#renderSpark();
    this.update();
  }

  #renderSpark(): void {
    this.#sparkEl?.remove();
    this.#sparkEl = null;
    const v = this.#spark;
    if (v.length < 2) return;
    const w = 200;
    const h = 36;
    let min = Infinity;
    let max = -Infinity;
    for (const n of v) {
      if (n < min) min = n;
      if (n > max) max = n;
    }
    const range = max - min || 1;
    const step = w / (v.length - 1);
    const yOf = (n: number): number => h - ((n - min) / range) * h;
    let d = "";
    v.forEach((n, i) => {
      d += `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${yOf(n).toFixed(1)} `;
    });
    d = d.trim();
    const svg = svgNode("svg", "jd-live-index-card__spark");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", String(h));
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const area = svgNode("path", "jd-live-index-card__spark-area");
    area.setAttribute("d", `${d} L${w},${h} L0,${h} Z`);
    const line = svgNode("path", "jd-live-index-card__spark-line");
    line.setAttribute("d", d);
    svg.append(area, line);
    this.#body.append(svg);
    this.#sparkEl = svg;
  }

  protected override update(): void {
    const label = this.label || this.code || "";
    this.#label.textContent = label;
    if (label) this.setAttribute("aria-label", `${label} 지수`);

    const up = (this.changePct ?? 0) >= 0;
    this.setAttribute("data-dir", up ? "up" : "down");

    const pctText = `${Math.abs(this.changePct ?? 0).toFixed(2)}%`;
    this.#pct.textContent = `${up ? "▲" : "▼"} ${pctText}`;
    this.#pct.setAttribute("aria-label", `등락률 ${up ? "+" : "-"}${pctText}`);

    this.#value.textContent = NF.format(this.value ?? 0);
    const diff = this.change ?? 0;
    this.#diff.textContent = `${up ? "+" : ""}${diff.toFixed(2)}`;

    if (this.source) this.title = this.source;
    else this.removeAttribute("title");
  }
}
