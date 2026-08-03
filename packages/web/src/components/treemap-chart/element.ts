/**
 * <jd-treemap-chart> — 값의 크기를 면적으로 보여주는 트리맵 (v2 composites/TreemapChart).
 *
 * SVG는 **createElementNS**로 만든다(§6-1). 배치는 v2와 같은 slice-and-dice
 * (남은 칸의 긴 변을 잘라 나가는 방식)다 — 함수 이름이 squarify였을 뿐 정사각
 * 근사는 v2도 하지 않았고, 종횡비가 달라지므로 그 성질은 승계한다.
 *
 * 데이터는 property + JSON 슬롯(§1.3 — 배열은 attribute 금지).
 *
 * v2 대비 교정 5건(1~4는 아래, 5는 #layout 주석 — 면적 비율 산식):
 *  1. **그림뿐이고 대체 텍스트가 없었다.** svg에 role도 이름도 없었고, 타일에
 *     `<title>`도 없었다. v3는 호스트가 role="figure" + 이름을 맡고, svg는
 *     장식으로 내린 뒤 **시각적으로 숨긴 목록**이 항목별 "라벨: 값 (비율%)"을
 *     말한다. 작은 타일은 원래 글자가 안 들어가 화면에서도 정보가 잘리는데,
 *     그 잘린 정보까지 이 목록이 복구한다.
 *  2. **`toLocaleString()`이 환경 로케일에 좌우됐다.** 프리렌더(헤드리스 Chrome)와
 *     방문자 브라우저의 로케일이 다르면 같은 숫자가 다른 문자열이 된다 —
 *     §3.1-3 결정적 렌더 규칙 위반이자 스냅샷 diff 노이즈다. 3자리 콤마 그룹핑을
 *     직접 한다(문자 단위로 결정적).
 *  3. **값 합이 0이거나 음수·NaN이 섞이면 좌표가 통째로 NaN**이 되어 아무것도
 *     그려지지 않았다(에러 없음). 유효 항목만 남기고, 합이 0이면 그리지 않는다.
 *  4. **`stroke="white"` 리터럴** — 다크 테마에서 흰 격자. 배경 토큰으로 번역(css).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import treemapChartStyles from "./treemap-chart.css.js";

const NS = "http://www.w3.org/2000/svg";

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(NS, tag);
}

const num = (v: number): string => String(Math.round(v * 1000) / 1000);

/** 교정 2 — 로케일 비의존 3자리 그룹핑 */
function groupDigits(v: number): string {
  if (!Number.isFinite(v)) return "0";
  const neg = v < 0;
  const abs = Math.abs(v);
  const int = Math.trunc(abs);
  const frac = Math.round((abs - int) * 100) / 100;
  let out = String(int).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (frac > 0) out += String(frac).slice(1);
  return neg ? `-${out}` : out;
}

export interface JdTreemapItem {
  label: string;
  value: number;
  /** CSS 색. 없으면 팔레트 순환 */
  color?: string;
}

/**
 * 팔레트 **슬롯**만 참조한다 — 실제 색은 treemap-chart.css.ts가 hue 램프에서 정한다.
 * v2 승계값은 info/success/warning/danger였는데, 의미색을 범주에 빌려 쓰면 네 번째
 * 타일이 "위험"이라고 말한다(§8). 색을 CSS에 두면 소비자가 한 줄로 갈아끼울 수도 있다.
 */
const PALETTE: readonly string[] = [
  "var(--jd-treemap-1)",
  "var(--jd-treemap-2)",
  "var(--jd-treemap-3)",
  "var(--jd-treemap-4)",
  "var(--jd-treemap-5)",
  "var(--jd-treemap-6)",
];

/** v2 라벨 표시 조건 */
const LABEL_MIN_W = 40;
const LABEL_MIN_H = 20;

interface Tile {
  x: number;
  y: number;
  w: number;
  h: number;
  item: JdTreemapItem;
}

export class JdTreemapChart extends JdElement {
  static override tag = "jd-treemap-chart";
  static override props = {
    width: { type: Number, default: 400 },
    height: { type: Number, default: 250 },
    /** 접근 이름 */
    label: { type: String },
  };

  declare width: number;
  declare height: number;
  declare label: string;

  #data: JdTreemapItem[] = [];
  #svg!: SVGSVGElement;
  #tiles!: SVGGElement;
  #sr!: HTMLElement;

  /** 트리맵 데이터 (§1.3 복합 데이터는 property 전용) */
  get data(): JdTreemapItem[] {
    return this.#data;
  }
  set data(v: JdTreemapItem[]) {
    this.#data = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(treemapChartStyles);
    this.#readJsonSlot();

    // 입양(§3.3)
    const existing = this.querySelector<SVGSVGElement>(":scope > .jd-treemap-chart__svg");
    if (existing) {
      this.#svg = existing;
      this.#tiles = existing.querySelector<SVGGElement>(".jd-treemap-chart__tiles")!;
      this.#sr = this.querySelector<HTMLElement>(":scope > .jd-treemap-chart__sr")!;
    } else {
      this.#build();
    }
    this.setAttribute("role", "figure");
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 */
  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed)) this.#data = parsed as JdTreemapItem[];
    } catch {
      console.warn("[junds] <jd-treemap-chart> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): void {
    this.#svg = svgEl("svg");
    this.#svg.setAttribute("class", "jd-treemap-chart__svg");
    this.#svg.setAttribute("aria-hidden", "true"); // 교정 1 — 대체 목록이 말한다
    this.#tiles = svgEl("g");
    this.#tiles.setAttribute("class", "jd-treemap-chart__tiles");
    this.#svg.append(this.#tiles);

    this.#sr = this.ownerDocument.createElement("ul");
    this.#sr.className = "jd-treemap-chart__sr";

    this.append(this.#svg, this.#sr);
  }

  protected override update(): void {
    const w = this.#px(this.width, 400);
    const h = this.#px(this.height, 250);
    this.#svg.setAttribute("width", num(w));
    this.#svg.setAttribute("height", num(h));
    this.#svg.setAttribute("viewBox", `0 0 ${num(w)} ${num(h)}`);
    this.setAttribute("aria-label", this.label || "트리맵 차트");

    // 교정 3 — 유효 항목만
    const items = this.#data.filter(
      (d): d is JdTreemapItem => Boolean(d) && Number.isFinite(d.value) && d.value > 0,
    );
    const sorted = [...items].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((s, d) => s + d.value, 0);
    const tiles = total > 0 ? this.#layout(sorted, total, w, h) : [];

    this.#syncTiles(tiles);
    this.#syncAlt(tiles, total);
  }

  /**
   * slice-and-dice — 남은 칸의 긴 변을 잘라 나간다.
   *
   * 교정 5(v2 결함): v2는 비율을 **전체 합**으로 나눴다. 첫 타일 이후로는 남은 칸의
   * 면적이 이미 줄어 있으므로, 같은 비율을 다시 적용하면 타일이 실제 몫보다 작아지고
   * 마지막에는 칸이 빈 채로 남는다(4,200/2,600/1,200/640/180을 400×250에 그리면
   * 오른쪽 아래가 통째로 빈다). 면적이 값을 나타내는 게 트리맵의 전부인데 그 면적이
   * 틀렸다. **남은 합**으로 나누면 불변식(남은 칸 면적 : 남은 합)이 유지되어
   * 모든 타일의 면적이 값에 정확히 비례하고 칸이 정확히 채워진다.
   */
  #layout(items: JdTreemapItem[], total: number, w: number, h: number): Tile[] {
    const out: Tile[] = [];
    let cx = 0;
    let cy = 0;
    let cw = w;
    let ch = h;
    let remaining = total;
    for (const item of items) {
      const ratio = remaining > 0 ? item.value / remaining : 1;
      remaining -= item.value;
      if (cw >= ch) {
        const rw = cw * ratio;
        out.push({ x: cx, y: cy, w: Math.max(rw, 1), h: ch, item });
        cx += rw;
        cw -= rw;
      } else {
        const rh = ch * ratio;
        out.push({ x: cx, y: cy, w: cw, h: Math.max(rh, 1), item });
        cy += rh;
        ch -= rh;
      }
    }
    return out;
  }

  /** 입양(§3.3): 개수가 같으면 노드를 만들지 않고 좌표만 갱신 */
  #syncTiles(tiles: Tile[]): void {
    const groups = Array.from(this.#tiles.children) as SVGGElement[];
    if (groups.length !== tiles.length) {
      this.#tiles.replaceChildren(...tiles.map(() => this.#createTile()));
    }
    const els = Array.from(this.#tiles.children) as SVGGElement[];
    tiles.forEach((t, i) => {
      const g = els[i];
      if (!g) return;
      const rect = g.querySelector<SVGRectElement>(".jd-treemap-chart__rect")!;
      const title = rect.querySelector("title")!;
      const label = g.querySelector<SVGTextElement>(".jd-treemap-chart__label")!;
      const value = g.querySelector<SVGTextElement>(".jd-treemap-chart__value")!;

      rect.setAttribute("x", num(t.x));
      rect.setAttribute("y", num(t.y));
      rect.setAttribute("width", num(t.w));
      rect.setAttribute("height", num(t.h));
      rect.style.setProperty(
        "--jd-treemap-chart-fill",
        t.item.color || PALETTE[i % PALETTE.length] || "var(--jd-color-primary)",
      );
      title.textContent = `${t.item.label}: ${groupDigits(t.item.value)}`;

      const show = t.w > LABEL_MIN_W && t.h > LABEL_MIN_H;
      const midX = num(t.x + t.w / 2);
      label.setAttribute("x", midX);
      label.setAttribute("y", num(t.y + t.h / 2 - 4));
      label.textContent = t.item.label;
      label.toggleAttribute("hidden", !show);
      value.setAttribute("x", midX);
      value.setAttribute("y", num(t.y + t.h / 2 + 10));
      value.textContent = groupDigits(t.item.value);
      value.toggleAttribute("hidden", !show);
    });
  }

  #createTile(): SVGGElement {
    const g = svgEl("g");
    g.setAttribute("class", "jd-treemap-chart__tile");
    const rect = svgEl("rect");
    rect.setAttribute("class", "jd-treemap-chart__rect");
    rect.setAttribute("rx", "4");
    rect.append(svgEl("title")); // 마우스 툴팁 (v2에는 없었다)
    const label = svgEl("text");
    label.setAttribute("class", "jd-treemap-chart__label");
    label.setAttribute("text-anchor", "middle");
    const value = svgEl("text");
    value.setAttribute("class", "jd-treemap-chart__value");
    value.setAttribute("text-anchor", "middle");
    g.append(rect, label, value);
    return g;
  }

  /** 교정 1 — 시각적으로 숨긴 텍스트 등가물 */
  #syncAlt(tiles: Tile[], total: number): void {
    const doc = this.ownerDocument;
    this.#sr.replaceChildren(
      ...tiles.map((t) => {
        const li = doc.createElement("li");
        const share = total > 0 ? Math.round((t.item.value / total) * 1000) / 10 : 0;
        li.textContent = `${t.item.label}: ${groupDigits(t.item.value)} (${share}%)`;
        return li;
      }),
    );
  }

  #px(v: number, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }
}
