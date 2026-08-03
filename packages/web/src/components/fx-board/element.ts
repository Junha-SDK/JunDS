/**
 * <jd-fx-board> — 환율·원자재·암호화폐 라이브 시세판 (v2 finance/FXBoard).
 *
 * DEC-003 준수: v2는 컴포넌트가 직접 `/api/fx`를 fetch하고 30초 타이머를 돌렸다.
 * v3 컴포넌트는 **데이터를 받기만** 한다 — `el.items = [...]`(또는 JSON 슬롯)로 시세를
 * 넣고, 연결 상태는 `source` 프로퍼티로 알린다. fetch/타이머는 @junds/finance-data 몫.
 *
 * 트렌드(▲/▼)는 v2처럼 **직전 값과의 차이**로 판정한다 — items를 다시 대입하면
 * 이전 배열을 심볼 기준으로 비교해 셀별 tick 방향을 정한다(item.trend 명시 시 그것 우선).
 *
 * v2 대비 교정:
 *  1. **toLocaleString 제거.** 로케일 의존 포맷은 프리렌더 HTML과 방문자 렌더를
 *     어긋나게 한다(§3.1-3) — 소수 자릿수 고정 + 직접 천단위 구분으로 결정적.
 *  2. 시세 tick 화살표는 색·글리프로만 방향을 전했다 → aria-hidden + 숨김 낱말.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import fxBoardStyles from "./fx-board.css.js";

export type JdFxCategory = "fx" | "commodity" | "crypto";
export type JdFxTrend = "up" | "down" | "flat";

export interface JdFxItem {
  symbol: string;
  label: string;
  unit: string;
  value: number;
  /** 일간 변동 % */
  pct: number;
  /** 표시 소수 자릿수 */
  decimals: number;
  cat: JdFxCategory;
  /** 명시 tick 방향 — 없으면 직전 값과 비교해 자동 판정 */
  trend?: JdFxTrend;
}

const CAT_LABEL: Record<JdFxCategory, string> = {
  fx: "환율",
  commodity: "원자재",
  crypto: "암호화폐",
};

/** v2 CAT_COLOR — fx=accent-strong(teal)/commodity=warning/crypto=purple(리터럴 승계) */
const CAT_COLOR: Record<JdFxCategory, string> = {
  fx: "var(--jd-color-accent)",
  commodity: "var(--jd-color-warning)",
  crypto: "#a855f7",
};

const TREND_GLYPH: Record<JdFxTrend, string> = { up: "▲", down: "▼", flat: "" };
const TREND_WORD: Record<JdFxTrend, string> = { up: "상승", down: "하락", flat: "보합" };

/** 소수 고정 + 직접 천단위 구분 — toLocaleString의 로케일 비결정성 회피(§3.1-3) */
function fmtNum(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return "0";
  const neg = value < 0;
  const fixed = Math.abs(value).toFixed(Math.max(0, decimals | 0));
  const [int = "0", frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
}

function toItems(v: unknown): JdFxItem[] {
  if (!Array.isArray(v)) return [];
  const cats: JdFxCategory[] = ["fx", "commodity", "crypto"];
  const out: JdFxItem[] = [];
  for (const raw of v as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    out.push({
      symbol: String(raw.symbol ?? ""),
      label: String(raw.label ?? ""),
      unit: String(raw.unit ?? ""),
      value: typeof raw.value === "number" && Number.isFinite(raw.value) ? raw.value : 0,
      pct: typeof raw.pct === "number" && Number.isFinite(raw.pct) ? raw.pct : 0,
      decimals: typeof raw.decimals === "number" ? raw.decimals : 2,
      cat: cats.includes(raw.cat as JdFxCategory) ? (raw.cat as JdFxCategory) : "fx",
      trend:
        raw.trend === "up" || raw.trend === "down" || raw.trend === "flat"
          ? (raw.trend as JdFxTrend)
          : undefined,
    });
  }
  return out;
}

export class JdFxBoard extends JdElement {
  static override tag = "jd-fx-board";
  static override props = {
    /** 헤더 제목 */
    label: { type: String, default: "환율 · 원자재 · 암호화폐" },
    /** 연결 상태 — loading | live | error (스타일 훅) */
    source: { type: String, default: "loading", reflect: true },
    /** 우측 상태 문구 — 비우면 source로 파생 */
    sourceLabel: { type: String },
  };

  declare label: string;
  declare source: string;
  declare sourceLabel: string;

  #items: JdFxItem[] = [];
  #prev: JdFxItem[] = [];
  #titleEl!: HTMLElement;
  #statusEl!: HTMLElement;
  #grid!: HTMLElement;

  get items(): JdFxItem[] {
    return this.#items;
  }
  set items(v: JdFxItem[]) {
    this.#prev = this.#items;
    this.#items = toItems(v);
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(fxBoardStyles);
    if (this.#items.length === 0) {
      const script = this.querySelector<HTMLScriptElement>(
        ':scope > script[type="application/json"]',
      );
      if (script) {
        try {
          this.#items = toItems(JSON.parse(script.textContent || "[]"));
        } catch {
          /* 잘못된 JSON은 무시 — 렌더를 깨뜨리지 않는다 */
        }
        script.remove();
      }
    }
    this.setAttribute("role", "region");

    let head = this.querySelector<HTMLElement>(":scope > .jd-fx-board__head");
    if (!head) {
      head = document.createElement("div");
      head.className = "jd-fx-board__head";
      const pulse = document.createElement("span");
      pulse.className = "jd-fx-board__pulse";
      pulse.setAttribute("aria-hidden", "true");
      const live = document.createElement("span");
      live.className = "jd-fx-board__live";
      live.textContent = "LIVE";
      this.#titleEl = document.createElement("span");
      this.#titleEl.className = "jd-fx-board__title";
      this.#statusEl = document.createElement("span");
      this.#statusEl.className = "jd-fx-board__status";
      head.append(pulse, live, this.#titleEl, this.#statusEl);
      this.#grid = document.createElement("div");
      this.#grid.className = "jd-fx-board__grid";
      this.append(head, this.#grid);
    } else {
      this.#titleEl = head.querySelector(".jd-fx-board__title")!;
      this.#statusEl = head.querySelector(".jd-fx-board__status")!;
      this.#grid = this.querySelector(":scope > .jd-fx-board__grid")!;
    }
    this.update();
  }

  #statusText(): string {
    if (this.sourceLabel) return this.sourceLabel;
    if (this.source === "live") return "실시간 갱신";
    if (this.source === "error") return "데이터 없음";
    return "연결 중…";
  }

  protected override update(): void {
    this.#titleEl.textContent = this.label;
    this.setAttribute("aria-label", `${this.label} 시세`);
    this.#statusEl.textContent = this.#statusText();

    const grid = this.#grid;
    // 열 수만 넘기고 폭은 CSS가 정한다 — grid-template-columns를 인라인으로 박으면
    // 어떤 레이어도 이길 수 없어, 종목이 늘어날수록 칸이 눌리는 것을 시트가 막을 수 없다.
    grid.style.setProperty("--jd-fx-count", String(Math.max(1, this.#items.length)));
    if (grid.children.length !== this.#items.length) {
      grid.textContent = "";
      for (let i = 0; i < this.#items.length; i++) grid.append(this.#buildCell());
    }

    const prevBySymbol = new Map(this.#prev.map((p) => [p.symbol, p]));
    this.#items.forEach((it, i) => {
      const cell = grid.children[i] as HTMLElement;
      const prev = prevBySymbol.get(it.symbol);
      const trend: JdFxTrend =
        it.trend ??
        (prev ? (it.value > prev.value ? "up" : it.value < prev.value ? "down" : "flat") : "flat");
      const color = CAT_COLOR[it.cat];
      cell.style.setProperty("--jd-fx-cat", color);
      cell.dataset.trend = trend;
      cell.toggleAttribute("data-last", i === this.#items.length - 1);

      cell.querySelector<HTMLElement>(".jd-fx-cell__label")!.textContent = it.label;
      const pill = cell.querySelector<HTMLElement>(".jd-fx-cell__cat")!;
      pill.textContent = CAT_LABEL[it.cat];

      cell.querySelector<HTMLElement>(".jd-fx-cell__arrow")!.textContent = TREND_GLYPH[trend];
      cell.querySelector<HTMLElement>(".jd-fx-cell__trend-word")!.textContent = TREND_WORD[trend];
      cell.querySelector<HTMLElement>(".jd-fx-cell__value")!.textContent = fmtNum(
        it.value,
        it.decimals,
      );
      cell.querySelector<HTMLElement>(".jd-fx-cell__unit")!.textContent = it.unit;

      const up = it.pct >= 0;
      const pctEl = cell.querySelector<HTMLElement>(".jd-fx-cell__pct")!;
      pctEl.textContent = `${up ? "+" : ""}${it.pct.toFixed(2)}%`;
      pctEl.dataset.dir = up ? "up" : "down";
      cell.querySelector<HTMLElement>(".jd-fx-cell__symbol")!.textContent = it.symbol;
    });
  }

  #buildCell(): HTMLElement {
    const cell = document.createElement("div");
    cell.className = "jd-fx-cell";

    const top = document.createElement("div");
    top.className = "jd-fx-cell__top";
    const dot = document.createElement("span");
    dot.className = "jd-fx-cell__dot";
    dot.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "jd-fx-cell__label";
    const cat = document.createElement("span");
    cat.className = "jd-fx-cell__cat";
    top.append(dot, label, cat);

    const valueRow = document.createElement("div");
    valueRow.className = "jd-fx-cell__value-row";
    const arrow = document.createElement("span");
    arrow.className = "jd-fx-cell__arrow";
    arrow.setAttribute("aria-hidden", "true");
    const word = document.createElement("span");
    word.className = "jd-fx-cell__trend-word jd-fx-cell__sr";
    const value = document.createElement("span");
    value.className = "jd-fx-cell__value";
    const unit = document.createElement("span");
    unit.className = "jd-fx-cell__unit";
    valueRow.append(arrow, word, value, unit);

    const pct = document.createElement("span");
    pct.className = "jd-fx-cell__pct";
    const symbol = document.createElement("span");
    symbol.className = "jd-fx-cell__symbol";

    cell.append(top, valueRow, pct, symbol);
    return cell;
  }
}
