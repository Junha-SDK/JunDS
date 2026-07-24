/**
 * <jd-heatmap> — 날짜별 값을 색 강도로 표현하는 히트맵 (v2 composites/Heatmap).
 *
 * 데이터는 property + JSON 슬롯(§1.3 — 배열은 attribute 금지):
 *  1. `data`(Array<{date,value}>) · `colorScale`(string[]) 프로퍼티
 *  2. 자식 `<script type="application/json">`: 배열이면 data, 객체면
 *     `{ data, colorScale }` 둘 다 (배열 입력이 2개라 객체 형태도 받는다)
 *
 * v2 대비 교정 5건:
 *  1. **AT에는 아무것도 없었다.** 중첩 div + `title` 속성뿐이라, 화면을 못 보는
 *     사용자에게 이 컴포넌트는 빈 상자였다(title은 낭독 보장이 없고 키보드로는
 *     닿지도 않는다). v3는 **진짜 표**다 — 행=요일, 열=주, 셀 안에 "날짜: 값"을
 *     시각적으로만 숨겨 넣는다. 스크린리더가 격자를 그대로 훑을 수 있고, 셀이
 *     저마다 날짜를 말하므로 행 머리 셀은 두지 않는다(#build 주석 참조).
 *  2. **요일 정렬이 깨져 있었다.** `getDay()`를 계산해 놓고 "일요일이면 새 열"
 *     판정에만 쓰고 **배치에는 안 썼다** — 수요일에 시작하는 데이터는 수요일 칸이
 *     맨 윗줄(일요일 자리)에 그려졌다. 잔디 그래프에서 요일 축이 어긋나면 그림이
 *     거짓말을 한다. 요일을 행 번호로 그대로 쓴다.
 *  3. **타임존에 따라 요일이 하루 밀렸다.** `new Date("2026-01-05").getDay()`는
 *     UTC 자정을 로컬로 환산한다 — UTC-5에서는 전날이 되어 열 경계가 어긋났다.
 *     프리렌더(§3.1-3 결정적 렌더)와 방문자 브라우저의 결과가 달라지는 문제이기도
 *     하다. `YYYY-MM-DD`는 UTC로 직접 파싱한다.
 *  4. **음수 값이 셀을 투명하게 만들었다.** `Math.ceil(음수)`가 0 이하 → 배열
 *     인덱스가 음수 → `colorScale[-1]`은 undefined → 색 없는 구멍. 0으로 잘라낸다.
 *  5. **빈 셀 색 `#ebedf0`은 라이트 전용 리터럴**이라 다크에서 흰 격자가 됐다.
 *     0단계만 border-light 토큰으로 번역하고 나머지 4단(GitHub 잔디 초록)은
 *     정체성이므로 리터럴 유지 — 두 테마 모두에서 성립한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import heatmapStyles from "./heatmap.css.js";

export interface JdHeatmapCell {
  /** YYYY-MM-DD 권장 */
  date: string;
  value: number;
}

/** v2 GitHub 스케일 — 0단계만 토큰(교정 5) */
const DEFAULT_COLORS: readonly string[] = [
  "var(--jd-color-border-light)",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
];

const ROWS = 7; // 행 = 요일(일~토)

/** 교정 3 — YYYY-MM-DD는 UTC로 읽어 타임존 독립·프리렌더 결정적 */
function weekdayOf(date: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(date));
  if (m) {
    const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(t) ? -1 : new Date(t).getUTCDay();
  }
  const parsed = Date.parse(String(date));
  return Number.isNaN(parsed) ? -1 : new Date(parsed).getUTCDay();
}

export class JdHeatmap extends JdElement {
  static override tag = "jd-heatmap";
  static override props = {
    /** 셀 한 변(px) */
    cellSize: { type: Number, default: 12 },
    /** 셀 간격(px) */
    gap: { type: Number, default: 2 },
    /** 범례 숨김 (Boolean은 부재가 기본값이라 show가 아니라 hide로 둔다) */
    hideLegend: { type: Boolean, reflect: true },
    /** 표의 접근 이름 */
    label: { type: String },
  };

  declare cellSize: number;
  declare gap: number;
  declare hideLegend: boolean;
  declare label: string;

  #data: JdHeatmapCell[] = [];
  #colors: readonly string[] = DEFAULT_COLORS;
  #dirty = true;

  #table!: HTMLTableElement;
  #body!: HTMLTableSectionElement;
  #legend!: HTMLElement;

  get data(): JdHeatmapCell[] {
    return this.#data;
  }
  set data(v: JdHeatmapCell[]) {
    this.#data = Array.isArray(v) ? v : [];
    this.#dirty = true;
    this.requestUpdate();
  }

  get colorScale(): readonly string[] {
    return this.#colors;
  }
  set colorScale(v: readonly string[]) {
    this.#colors = Array.isArray(v) && v.length > 0 ? v : DEFAULT_COLORS;
    this.#dirty = true;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(heatmapStyles);
    this.#readJsonSlot();

    // 입양(§3.3)
    const table = this.querySelector<HTMLTableElement>(":scope > .jd-heatmap__grid");
    if (table) {
      this.#table = table;
      this.#body = table.querySelector("tbody")!;
      this.#legend = this.querySelector<HTMLElement>(":scope > .jd-heatmap__legend")!;
    } else {
      this.#build();
    }
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비. 배열이면 data, 객체면 {data, colorScale} */
  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed)) {
        this.#data = parsed as JdHeatmapCell[];
      } else if (parsed && typeof parsed === "object") {
        const o = parsed as { data?: unknown; colorScale?: unknown };
        if (Array.isArray(o.data)) this.#data = o.data as JdHeatmapCell[];
        if (Array.isArray(o.colorScale) && o.colorScale.length > 0) {
          this.#colors = o.colorScale as string[];
        }
      }
    } catch {
      console.warn("[junds] <jd-heatmap> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): void {
    const doc = this.ownerDocument;
    this.#table = doc.createElement("table");
    this.#table.className = "jd-heatmap__grid";

    this.#body = doc.createElement("tbody");
    // 행 머리(요일) 셀은 두지 않는다: 셀마다 날짜를 그대로 말하므로 요일은 이미
    // 그 안에 있고, 시각적으로 숨긴 <th>라도 표는 **열을 하나 더 만든다**
    // (0폭이어도 border-spacing 한 칸을 더 먹어 격자가 v2보다 밀린다).
    for (let r = 0; r < ROWS; r++) this.#body.append(doc.createElement("tr"));
    this.#table.append(this.#body);

    this.#legend = doc.createElement("div");
    this.#legend.className = "jd-heatmap__legend";
    // 값은 셀이 이미 텍스트로 말한다 — 범례는 색 대응표(시각 전용)
    this.#legend.setAttribute("aria-hidden", "true");

    this.append(this.#table, this.#legend);
  }

  protected override update(): void {
    const size = this.#px(this.cellSize, 12);
    const gap = this.#px(this.gap, 2, true);
    this.style.setProperty("--jd-heatmap-cell-size", `${size}px`);
    this.style.setProperty("--jd-heatmap-gap", `${gap}px`);

    // 접근 이름은 <caption>이 아니라 aria-label로 준다: 시각적으로 숨긴 caption도
    // 표 위에 캡션 박스를 남겨(격자가 2px 아래로 밀린다) v2 바운딩 박스가 어긋난다.
    this.#table.setAttribute("aria-label", this.label || "활동 히트맵");
    this.#legend.toggleAttribute("hidden", this.hideLegend);

    if (!this.#dirty) return;
    this.#dirty = false;
    this.#syncCells();
    this.#syncLegend();
  }

  /**
   * 열 = 주(일요일 시작), 행 = 요일. v2의 "일요일이면 새 열" 규칙은 유지하되
   * 요일을 **행 번호로도** 쓴다(교정 2). 같은 열의 같은 요일이 중복되면
   * (정렬 안 된 입력) 덮어쓰지 않고 다음 열을 연다.
   */
  #columns(): (JdHeatmapCell | null)[][] {
    const cols: (JdHeatmapCell | null)[][] = [];
    let col: (JdHeatmapCell | null)[] = new Array<JdHeatmapCell | null>(ROWS).fill(null);
    let used = false;
    for (const cell of this.#data) {
      if (!cell || typeof cell !== "object") continue;
      let row = weekdayOf(cell.date);
      if (row < 0) row = col.indexOf(null); // 날짜를 못 읽으면 빈 자리에
      if (row < 0) row = 0;
      if (used && (row === 0 || col[row] !== null)) {
        cols.push(col);
        col = new Array<JdHeatmapCell | null>(ROWS).fill(null);
        used = false;
      }
      col[row] = cell;
      used = true;
    }
    if (used) cols.push(col);
    return cols;
  }

  #syncCells(): void {
    const doc = this.ownerDocument;
    const cols = this.#columns();
    const maxVal = Math.max(
      1,
      ...this.#data.map((d) => (Number.isFinite(d?.value) ? Number(d.value) : 0)),
    );
    const rows = Array.from(this.#body.rows);

    rows.forEach((tr, r) => {
      while (tr.cells.length > cols.length) tr.deleteCell(-1);
      while (tr.cells.length < cols.length) {
        const td = doc.createElement("td");
        td.className = "jd-heatmap__cell";
        const sr = doc.createElement("span");
        sr.className = "jd-heatmap__sr";
        td.append(sr);
        tr.append(td);
      }
      cols.forEach((col, c) => {
        const td = tr.cells[c];
        if (!td) return;
        const cell = col[r] ?? null;
        const sr = td.querySelector<HTMLElement>(".jd-heatmap__sr");
        if (!cell) {
          td.style.removeProperty("--jd-heatmap-cell");
          td.removeAttribute("title");
          if (sr) sr.textContent = "";
          return;
        }
        const value = Number.isFinite(cell.value) ? Number(cell.value) : 0;
        td.style.setProperty("--jd-heatmap-cell", this.#color(value, maxVal));
        td.title = `${cell.date}: ${value}`; // v2 마우스 툴팁 유지
        if (sr) sr.textContent = `${cell.date}: ${value}`;
      });
    });
  }

  #syncLegend(): void {
    const doc = this.ownerDocument;
    const swatches = this.#colors.map((c) => {
      const s = doc.createElement("span");
      s.className = "jd-heatmap__swatch";
      s.style.setProperty("--jd-heatmap-cell", c);
      return s;
    });
    const less = doc.createElement("span");
    less.textContent = "Less";
    const more = doc.createElement("span");
    more.textContent = "More";
    this.#legend.replaceChildren(less, ...swatches, more);
  }

  /** v2 산식 + 음수·비수치 방어(교정 4) */
  #color(value: number, maxVal: number): string {
    const last = this.#colors.length - 1;
    const zero = this.#colors[0] ?? DEFAULT_COLORS[0]!;
    if (last <= 0 || !Number.isFinite(value) || value <= 0) return zero;
    const idx = Math.min(last, Math.max(1, Math.ceil((value / maxVal) * last)));
    return this.#colors[idx] ?? zero;
  }

  #px(v: number, fallback: number, allowZero = false): number {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    if (n < 0) return fallback;
    return n === 0 && !allowZero ? fallback : n;
  }
}
