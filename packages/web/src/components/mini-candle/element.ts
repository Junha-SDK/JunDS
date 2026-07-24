/**
 * <jd-mini-candle> — 카드 안에 들어가는 소형 캔들 스파크라인 (v2 finance/MiniCandle).
 *
 * SVG는 **createElementNS**로 만든다(§6-1 네임스페이스 함정 — document.createElement로
 * 만든 <line>/<rect>는 HTML 미지 요소가 되어 에러 없이 아무것도 그려지지 않는다).
 *
 * v2는 `seed` 하나만 받아 내부에서 seedCandles()로 mock을 생성했다. DS 컴포넌트는
 * **데이터를 우선**으로 받는다(§1.3 복합 데이터는 property/JSON 슬롯):
 *   1. `candles` 프로퍼티 — Array<{o,h,l,c}>
 *   2. 자식 `<script type="application/json">[{…}]</script>` (jd-mini-chart 선례)
 * 데이터가 없고 `seed`가 주어지면 v2와 **문자 단위로 동일한** 결정적 생성기로 채운다
 * (mulberry32 — Math.random/Date 금지 §3.1-3, 프리렌더 스냅샷 안정).
 *
 * v2 대비 교정:
 *  1. **색이 표시 속성 인라인이었다**(stroke={color}). v3는 data-dir(up/down)로 옮겨
 *     CSS가 칠한다 — 테마·상태 오버라이드가 열린다(candle-chart와 동일 철학).
 *  2. **접근성 0**(순수 장식도 명시 안 됨). `label`을 주면 role=img로 승격,
 *     없으면 aria-hidden 장식으로 둔다(jd-mini-chart와 동형).
 *  3. **비수치 오염 방어** — NaN/Infinity 캔들은 좌표를 통째로 무너뜨리므로 걸러낸다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import miniCandleStyles from "./mini-candle.css.js";

const NS = "http://www.w3.org/2000/svg";

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(NS, tag);
}

/** 부동소수 꼬리를 잘라 프리렌더 스냅샷 diff를 안정화 */
const num = (v: number): string => String(Math.round(v * 1000) / 1000);

export interface JdCandleBar {
  o: number;
  h: number;
  l: number;
  c: number;
}

function finite(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function toBars(v: unknown): JdCandleBar[] {
  if (!Array.isArray(v)) return [];
  const out: JdCandleBar[] = [];
  for (const raw of v as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    const { o, h, l, c } = raw;
    if (finite(o) && finite(h) && finite(l) && finite(c)) out.push({ o, h, l, c });
  }
  return out;
}

/** v2 lib/mock의 mulberry32 — 결정적 의사난수 */
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** v2 seedCandles(seed, count, base, vol) — o/h/l/c만 (v는 미니 캔들에 불필요) */
function seedBars(seed: number, count: number, base: number, vol: number): JdCandleBar[] {
  const r = mulberry32(seed);
  const out: JdCandleBar[] = [];
  let prevClose = base;
  for (let i = 0; i < count; i += 1) {
    const drift = (r() - 0.48) * 2 * vol;
    const o = prevClose;
    const c = Math.max(1, o * (1 + drift));
    const h = Math.max(o, c) * (1 + r() * vol * 0.6);
    const l = Math.min(o, c) * (1 - r() * vol * 0.6);
    out.push({ o, h, l, c });
    prevClose = c;
  }
  return out;
}

export type JdMiniCandleTone = "up" | "down" | "flat" | "";

export class JdMiniCandle extends JdElement {
  static override tag = "jd-mini-candle";
  static override props = {
    width: { type: Number, default: 36 },
    height: { type: Number, default: 22 },
    /** up|down이면 모든 캔들을 한 색으로 강제, 그 외(flat/미지정)는 캔들별 등락색 */
    tone: { type: String, default: "", reflect: true },
    /** seed 폴백 생성 시 캔들 개수 (v2 기본 8) */
    count: { type: Number, default: 8 },
    /** 데이터가 없을 때 결정적 mock을 생성할 시드. 음수/미지정이면 생성 안 함 */
    seed: { type: Number, default: -1 },
    /** 접근 이름. 주면 정보 그래픽(role=img), 없으면 장식(aria-hidden) */
    label: { type: String },
  };

  declare width: number;
  declare height: number;
  declare tone: string;
  declare count: number;
  declare seed: number;
  declare label: string;

  #candles: JdCandleBar[] = [];
  #svg: SVGSVGElement | null = null;

  /** 캔들 데이터 (§1.3 복합 데이터는 property 전용) */
  get candles(): JdCandleBar[] {
    return this.#candles;
  }
  set candles(v: JdCandleBar[]) {
    this.#candles = toBars(v);
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(miniCandleStyles);
    this.#readJsonSlot();
    // 입양(§3.3): 프리렌더/어댑터가 그린 svg가 있으면 재사용
    this.#svg = this.querySelector<SVGSVGElement>(":scope > .jd-mini-candle__svg");
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      const bars = toBars(parsed);
      if (bars.length > 0) this.#candles = bars;
    } catch {
      console.warn("[junds] <jd-mini-candle> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 데이터 우선, 없으면 seed로 결정적 생성 (v2 seedCandles(seed,count,100,0.04)) */
  #resolve(): JdCandleBar[] {
    if (this.#candles.length > 0) return this.#candles;
    const seed = Number(this.seed);
    if (Number.isFinite(seed) && seed >= 0) {
      const count = Math.max(2, Math.round(this.#px(this.count, 8)));
      return seedBars(seed, count, 100, 0.04);
    }
    return [];
  }

  protected override update(): void {
    const bars = this.#resolve();
    if (bars.length === 0) {
      this.#svg?.remove();
      this.#svg = null;
      return;
    }

    const w = this.#px(this.width, 36);
    const h = this.#px(this.height, 22);
    const svg = this.#svg ?? this.#build();
    svg.setAttribute("width", num(w));
    svg.setAttribute("height", num(h));
    svg.setAttribute("viewBox", `0 0 ${num(w)} ${num(h)}`);

    if (this.label) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", this.label);
      svg.removeAttribute("aria-hidden");
    } else {
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("role");
      svg.removeAttribute("aria-label");
    }

    svg.replaceChildren(...this.#draw(bars, w, h));
  }

  #build(): SVGSVGElement {
    const svg = svgEl("svg");
    svg.setAttribute("class", "jd-mini-candle__svg");
    this.append(svg);
    this.#svg = svg;
    return svg;
  }

  /** v2 좌표 그대로: min=최저가, max=최고가, slot=width/n */
  #draw(bars: JdCandleBar[], w: number, h: number): SVGElement[] {
    let min = Infinity;
    let max = -Infinity;
    for (const c of bars) {
      if (c.l < min) min = c.l;
      if (c.h > max) max = c.h;
    }
    const range = max - min || 1;
    const slot = w / bars.length;
    const y = (v: number): number => ((max - v) / range) * (h - 2) + 1;

    return bars.map((c, i) => {
      const cx = i * slot + slot / 2;
      const yh = y(c.h);
      const yl = y(c.l);
      const yo = y(c.o);
      const yc = y(c.c);
      const top = Math.min(yo, yc);
      const bot = Math.max(yo, yc);

      const g = svgEl("g");
      g.setAttribute("class", "jd-mini-candle__candle");
      g.dataset.dir = c.c >= c.o ? "up" : "down";

      const wick = svgEl("line");
      wick.setAttribute("class", "jd-mini-candle__wick");
      wick.setAttribute("x1", num(cx));
      wick.setAttribute("x2", num(cx));
      wick.setAttribute("y1", num(yh));
      wick.setAttribute("y2", num(yl));

      const body = svgEl("rect");
      body.setAttribute("class", "jd-mini-candle__body");
      body.setAttribute("x", num(cx - slot * 0.32));
      body.setAttribute("y", num(top));
      body.setAttribute("width", num(slot * 0.64));
      body.setAttribute("height", num(Math.max(1, bot - top)));

      g.append(wick, body);
      return g;
    });
  }

  #px(v: number, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }
}
