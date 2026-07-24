/**
 * <jd-investor-flow-chart> — 투자자별 순매수 흐름 다이버징 막대 차트
 *   (v2 finance/InvestorFlowChart) = **JdChartBase 파생**.
 *
 * 하루당 외국인·기관·개인 3개 막대를 0축 기준 위(순매수)·아래(순매도)로 그린다.
 * jd-bar-chart를 상속하지 않는 이유: 그 차트는 음수 값을 0으로 clamp한다(음수 치수가
 * rect를 통째로 지우는 SVG 함정 회피 — bar-chart 주석 참조). 이 차트는 0축 다이버징이
 * 본질이라 전용 페인트가 필요하다. 대신 JdChartBase에서 figure 의미·범례·숨김 데이터
 * 표를 물려받는다.
 *
 * SVG는 createElementNS(svgNode)로만 만든다(§6-1 네임스페이스 함정) —
 * document.createElement("rect")는 HTML 네임스페이스 미지 요소가 되어 그려지지 않는다.
 *
 * 데이터 2경로(§1.3 복합 데이터는 attribute 금지):
 *  1. `data` 프로퍼티 (Array<{date, foreign, institution, individual}>)
 *  2. 자식 `<script type="application/json">[…]</script>` 슬롯
 *
 * v2 대비 개선: v2는 SVG의 role=img 이름 하나가 접근성의 전부였다. v3는 SVG를
 * 장식(aria-hidden)으로 두고 시각적으로만 숨긴 데이터 표를 함께 낸다(정보는 표가 말한다).
 */
import {
  JdChartBase,
  coord,
  positive,
  readChartJson,
  setAttrs,
  svgNode,
  upgradeAccessor,
} from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import investorFlowChartStyles from "./investor-flow-chart.css.js";

export interface JdDayFlow {
  date: string;
  /** 외국인 순매수(양수) / 순매도(음수) */
  foreign: number;
  /** 기관 순매수 / 순매도 */
  institution: number;
  /** 개인 순매수 / 순매도 */
  individual: number;
}

interface Actor {
  key: keyof Pick<JdDayFlow, "foreign" | "institution" | "individual">;
  label: string;
  /** 양수 막대 색(CSS 커스텀 프로퍼티) */
  pos: string;
  /** 음수 막대 색 */
  neg: string;
  /** 막대 중심 대비 가로 오프셋 배수(barW 단위) — v2 배치 그대로 */
  lane: number;
}

/** v2 액터 3종 — 색과 레인 오프셋은 원본 리터럴을 토큰으로 의미 번역 */
const ACTORS: readonly Actor[] = [
  { key: "foreign", label: "외국인", pos: "var(--jd-fin-foreign)", neg: "var(--jd-fin-foreign-neg)", lane: -1.6 },
  { key: "institution", label: "기관", pos: "var(--jd-fin-institution)", neg: "var(--jd-fin-institution-neg)", lane: -0.5 },
  { key: "individual", label: "개인", pos: "var(--jd-fin-individual)", neg: "var(--jd-fin-individual-neg)", lane: 0.6 },
];

/** v2 니스 스텝 — 눈금 간격을 1·2·5·10 계열로 반올림 */
function niceStep(raw: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(Math.max(0.1, raw))));
  const f = raw / exp;
  const nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nf * exp;
}

export class JdInvestorFlowChart extends JdChartBase {
  static override tag = "jd-investor-flow-chart";
  static override props = {
    ...JdChartBase.props,
    width: { type: Number, default: 800 },
    height: { type: Number, default: 240 },
  };

  declare width: number;
  declare height: number;

  #data: JdDayFlow[] = [];
  #svg!: SVGSVGElement;

  /** 데이터 (§1.3 복합 데이터는 property 전용) */
  get data(): JdDayFlow[] {
    return this.#data;
  }
  set data(v: JdDayFlow[]) {
    this.#data = this.#normalize(v);
    this.requestUpdate();
  }

  #normalize(v: unknown): JdDayFlow[] {
    if (!Array.isArray(v)) return [];
    const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
    return v
      .filter((d): d is Record<string, unknown> => Boolean(d) && typeof d === "object")
      .map((d) => ({
        date: typeof d.date === "string" ? d.date : "",
        foreign: num(d.foreign),
        institution: num(d.institution),
        individual: num(d.individual),
      }));
  }

  protected override render(): void {
    upgradeAccessor(this, "data");
    const json = readChartJson(this);
    if (Array.isArray(json) && this.#data.length === 0) this.#data = this.#normalize(json);

    adoptStyles(investorFlowChartStyles);

    // 입양(§3.3): 프리렌더/어댑터가 그린 svg가 있으면 재사용
    const existing = this.querySelector<SVGSVGElement>(":scope > .jd-ifc__svg");
    if (existing) {
      this.#svg = existing;
    } else {
      this.#svg = svgNode("svg", "jd-ifc__svg");
      this.#svg.setAttribute("aria-hidden", "true");
      this.prepend(this.#svg);
    }
    super.render(); // JdChartBase: role=figure + 범례/데이터표 골격 (paint는 트리거 안 함)
    // JdCartesianChart와 달리 JdChartBase.render는 첫 paint를 부르지 않는다 — 직접 트리거
    this.update();
  }

  protected defaultLabel(): string {
    return "투자자별 순매수 흐름";
  }

  protected override paint(): void {
    const w = positive(this.width, 800);
    const h = positive(this.height, 240);
    const data = this.#data;

    setAttrs(this.#svg, { width: w, height: h, viewBox: `0 0 ${w} ${h}` });
    this.#svg.textContent = "";
    this.#syncTable();
    if (data.length === 0) return;

    const padL = 38;
    const padR = 8;
    const padT = 14;
    const padB = 24;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const slot = innerW / data.length;
    const barW = Math.max(2, (slot * 0.78) / 3);

    let min = 0;
    let max = 0;
    for (const d of data) {
      min = Math.min(min, d.foreign, d.institution, d.individual);
      max = Math.max(max, d.foreign, d.institution, d.individual);
    }
    const range = max - min || 1;
    const yOf = (v: number): number => padT + ((max - v) / range) * innerH;

    // 가로 눈금선 + 값 라벨
    const step = niceStep(range / 4);
    for (let t = Math.ceil(min / step) * step; t <= max; t += step) {
      const y = coord(yOf(t));
      const line = svgNode("line", "jd-ifc__gridline");
      setAttrs(line, { x1: padL, x2: w - padR, y1: y, y2: y });
      this.#svg.append(line);
      const label = svgNode("text", "jd-ifc__tick");
      setAttrs(label, { x: padL - 4, y: coord(yOf(t) + 3), "text-anchor": "end" });
      label.textContent = String(Math.round(t));
      this.#svg.append(label);
    }

    // 0축
    const zero = svgNode("line", "jd-ifc__zero");
    setAttrs(zero, { x1: padL, x2: w - padR, y1: coord(yOf(0)), y2: coord(yOf(0)) });
    this.#svg.append(zero);

    // 일자별 3막대
    const y0 = yOf(0);
    const labelEvery = Math.max(1, Math.ceil(data.length / 8));
    data.forEach((d, i) => {
      const cx = padL + i * slot + slot / 2;
      for (const actor of ACTORS) {
        this.#bar(cx + barW * actor.lane, barW, d[actor.key], y0, yOf(d[actor.key]), actor);
      }
      if (i % labelEvery === 0 && d.date) {
        const dl = svgNode("text", "jd-ifc__date");
        setAttrs(dl, { x: coord(cx), y: h - 6, "text-anchor": "middle" });
        dl.textContent = d.date;
        this.#svg.append(dl);
      }
    });

    // 범례는 v2처럼 SVG 안에 — HTML 범례(JdChartBase)는 이 차트에서 숨긴다
    const legendG = svgNode("g", "jd-ifc__legend-g");
    legendG.setAttribute("transform", `translate(${coord(padL)}, 2)`);
    let lx = 0;
    for (const actor of ACTORS) {
      const item = svgNode("g");
      item.setAttribute("transform", `translate(${lx}, 0)`);
      const sw = svgNode("rect", "jd-ifc__swatch");
      setAttrs(sw, { x: 0, y: 0, width: 9, height: 9, rx: 2 });
      sw.style.setProperty("--_c", actor.pos);
      const tx = svgNode("text", "jd-ifc__legend-t");
      setAttrs(tx, { x: 13, y: 8 });
      tx.textContent = actor.label;
      item.append(sw, tx);
      legendG.append(item);
      lx += actor.label.length * 12 + 26;
    }
    this.#svg.append(legendG);
  }

  #bar(x: number, barW: number, v: number, y0: number, y: number, actor: Actor): void {
    const top = Math.min(y0, y);
    const height = Math.max(1, Math.abs(y - y0));
    const rect = svgNode("rect", "jd-ifc__bar");
    setAttrs(rect, { x: coord(x), y: coord(top), width: coord(barW), height: coord(height), rx: 1.5 });
    rect.style.setProperty("--_c", v >= 0 ? actor.pos : actor.neg);
    this.#svg.append(rect);
  }

  /** HTML 범례는 이 차트에서 항상 숨김(범례가 SVG 안에 있으므로) */
  protected override legendVisible(): boolean {
    return false;
  }

  #syncTable(): void {
    if (this.#data.length === 0) {
      this.syncTable([], []);
      return;
    }
    const head = ["날짜", ...ACTORS.map((a) => a.label)];
    const rows = this.#data.map((d) => [
      d.date || "—",
      ...ACTORS.map((a) => String(d[a.key])),
    ]);
    this.syncTable(head, rows);
  }
}
