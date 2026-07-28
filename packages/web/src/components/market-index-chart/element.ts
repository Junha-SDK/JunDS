/**
 * <jd-market-index-chart> — 시간대 전환 + 이동평균 범례를 두른 지수 캔들 차트
 * (v2 finance/MarketIndexChart).
 *
 * v2는 시간대(월/주/일/분)마다 `seedCandles()`로 목업 캔들을 **내부 생성**했다 — 데이터
 * 시딩은 DS 밖의 일이라, 이 이식은 **시간대 선택 UI + MA 범례**를 갖고 실제 그리기는
 * 형제 CE <jd-candle-chart>에 위임한다(합성; drawer→modal과 달리 is-a가 아니라 has-a).
 * 시간대별 캔들은 `data`(Record<시간대, 캔들[]>) 프로퍼티 또는 JSON 슬롯으로 받고,
 * 선택이 바뀌면 `jd-timeframe-change`를 발행하고 중첩 차트의 캔들을 교체한다.
 *
 * v2 대비 교정:
 *  1. MA 범례 색이 실제 그려지는 선 색과 어긋났다(v2 팔레트가 CandleChart의 MA색과 별개).
 *     범례를 <jd-candle-chart>의 MA 색(5·10·20·60·120)에 **정렬**한다 — 범례는 항상 선을 가리켜야 한다.
 *  2. "분 15분" 같은 목업 고정 접미사를 걷어내고 시간대 라벨을 그대로 쓴다(제네릭).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import indexChartStyles from "./market-index-chart.css.js";
import "../candle-chart/index.js"; // 형제 CE 등록(side-effect)
import type { JdCandle, JdCandleChart } from "../candle-chart/element.js";

interface JdXLabel {
  index: number;
  label: string;
}
export interface JdMarketIndexFrame {
  candles: JdCandle[];
  /** 구분선 위치(캔들 index). 없으면 host의 separatorIndex */
  separatorIndex?: number;
  xLabels?: JdXLabel[];
}
type FrameInput = JdCandle[] | JdMarketIndexFrame;

const DEFAULT_TFS = ["월", "주", "일", "분"];

/** <jd-candle-chart>의 MA_COLOR와 동일 매핑 — 범례가 실제 선을 가리킨다 */
const MA_LEGEND: readonly { period: number; color: string }[] = [
  { period: 5, color: "var(--jd-fin-cat-2, #22c55e)" },
  { period: 10, color: "var(--jd-fin-cat-1, #f59e0b)" },
  { period: 20, color: "var(--jd-fin-cat-4, #ef4444)" },
  { period: 60, color: "var(--jd-fin-cat-6, #a855f7)" },
  { period: 120, color: "var(--jd-fin-cat-7, #ec4899)" },
];

function normalizeFrame(v: FrameInput): JdMarketIndexFrame {
  if (Array.isArray(v)) return { candles: v };
  return {
    candles: Array.isArray(v?.candles) ? v.candles : [],
    separatorIndex: typeof v?.separatorIndex === "number" ? v.separatorIndex : undefined,
    xLabels: Array.isArray(v?.xLabels) ? v.xLabels : undefined,
  };
}

const px = (v: number, fallback: number): number => (Number.isFinite(v) && v > 0 ? v : fallback);

export class JdMarketIndexChart extends JdElement {
  static override tag = "jd-market-index-chart";
  static override props = {
    /** 현재 선택된 시간대 */
    timeframe: { type: String, default: "일", reflect: true },
    /** 중첩 차트 폭 */
    width: { type: Number, default: 1000 },
    /** 중첩 차트 높이 */
    height: { type: Number, default: 360 },
    /** 기본 구분선 위치(프레임별 값이 없을 때) */
    separatorIndex: { type: Number, default: -1, attribute: "separator-index" },
  };

  declare timeframe: string;
  declare width: number;
  declare height: number;
  declare separatorIndex: number;

  #timeframes: string[] = [...DEFAULT_TFS];
  #data: Record<string, JdMarketIndexFrame> = {};

  #tabsEl!: HTMLElement;
  #chart!: JdCandleChart;

  get timeframes(): string[] {
    return this.#timeframes;
  }
  set timeframes(v: string[]) {
    this.#timeframes =
      Array.isArray(v) && v.length > 0 ? v.map((s) => String(s)) : [...DEFAULT_TFS];
    this.requestUpdate();
  }

  get data(): Record<string, JdMarketIndexFrame> {
    return this.#data;
  }
  set data(v: Record<string, FrameInput>) {
    const next: Record<string, JdMarketIndexFrame> = {};
    if (v && typeof v === "object") {
      for (const [k, frame] of Object.entries(v)) next[k] = normalizeFrame(frame);
    }
    this.#data = next;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(indexChartStyles);
    this.#readJsonSlot();
    this.#upgrade("timeframes");
    this.#upgrade("data");

    const existing = this.querySelector<HTMLElement>(":scope > .jd-mic");
    if (existing) {
      this.#tabsEl = existing.querySelector(".jd-mic__tabs")!;
      this.#chart = existing.querySelector<JdCandleChart>(".jd-mic__chart")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #upgrade(name: "timeframes" | "data"): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const rec = this as unknown as Record<string, unknown>;
    const value = rec[name];
    delete rec[name];
    rec[name] = value;
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "null");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const obj = parsed as { timeframe?: unknown; timeframes?: unknown; data?: unknown };
        if (Array.isArray(obj.timeframes) && obj.timeframes.length > 0) {
          this.#timeframes = obj.timeframes.map((s) => String(s));
        }
        if (typeof obj.timeframe === "string") this.timeframe = obj.timeframe;
        if (obj.data && typeof obj.data === "object") {
          this.data = obj.data as Record<string, FrameInput>;
        }
      }
    } catch {
      console.warn(`[junds] <${this.localName}> JSON 슬롯 파싱 실패 — 무시합니다.`);
    }
    script.remove();
  }

  #build(): void {
    const card = document.createElement("div");
    card.className = "jd-mic";

    const toolbar = document.createElement("div");
    toolbar.className = "jd-mic__toolbar";
    this.#tabsEl = document.createElement("div");
    this.#tabsEl.className = "jd-mic__tabs";
    this.#tabsEl.setAttribute("role", "group");
    this.#tabsEl.setAttribute("aria-label", "시간대");

    const legend = document.createElement("ul");
    legend.className = "jd-mic__legend";
    legend.setAttribute("aria-label", "이동평균 범례");
    for (const { period, color } of MA_LEGEND) {
      const li = document.createElement("li");
      li.className = "jd-mic__legend-item";
      const swatch = document.createElement("span");
      swatch.className = "jd-mic__swatch";
      swatch.setAttribute("aria-hidden", "true");
      swatch.style.background = color;
      const label = document.createElement("span");
      label.textContent = String(period);
      li.append(swatch, label);
      legend.append(li);
    }
    toolbar.append(this.#tabsEl, legend);

    this.#chart = document.createElement("jd-candle-chart") as JdCandleChart;
    this.#chart.className = "jd-mic__chart";

    card.append(toolbar, this.#chart);
    this.append(card);
  }

  protected override connected(): void {
    this.#tabsEl.addEventListener("click", this.#onTabClick);
  }
  protected override disconnected(): void {
    this.#tabsEl.removeEventListener("click", this.#onTabClick);
  }

  #onTabClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".jd-mic__pill");
    if (!btn) return;
    const tf = btn.dataset.tf ?? "";
    if (!tf || tf === this.timeframe) return;
    this.timeframe = tf;
    this.emit("jd-timeframe-change", { timeframe: tf });
  };

  protected override update(): void {
    // 탭 개수가 바뀌면 재구축(입양)
    const tabs = this.#tabsEl;
    if (tabs.children.length !== this.#timeframes.length) {
      tabs.replaceChildren(
        ...this.#timeframes.map(() => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "jd-mic__pill";
          return b;
        }),
      );
    }
    this.#timeframes.forEach((tf, i) => {
      const btn = tabs.children[i] as HTMLButtonElement;
      btn.dataset.tf = tf;
      btn.textContent = tf;
      const active = tf === this.timeframe;
      btn.setAttribute("aria-pressed", String(active));
      btn.toggleAttribute("data-active", active);
    });

    // 중첩 차트에 현재 프레임 반영
    const frame = this.#data[this.timeframe];
    const w = px(this.width, 1000);
    const h = px(this.height, 360);
    this.#chart.width = w;
    this.#chart.height = h;
    this.#chart.separatorIndex = frame?.separatorIndex ?? this.separatorIndex;
    this.#chart.candles = frame?.candles ?? [];
    this.#chart.xLabels = frame?.xLabels ?? [];
    this.#chart.label = `${this.timeframe} 지수 캔들 차트`;
  }
}
