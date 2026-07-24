/**
 * <jd-position-bar> — 구간 대비 현재 위치 막대 (v2 finance/PositionBar).
 *
 * v2: 트랙(회색 h-2) 위에 [low,high] 밴드(반투명 tone색) + [low,cur] 채움(tone 원색) +
 * 정중앙(50%) 기준 마커. tone up/down으로 색이 갈린다. low/high/cur은 0~1 분수(×100 → %).
 *
 * 번역: 리터럴 red/blue를 레포의 finance 색 폴백 체인(--jd-finance-up/down)으로 옮겨
 * 앱이 재틴트할 수 있게 한다(jd-fx-board 선례). 좌표는 update()에서 인라인 %로만 —
 * 결정적(§3.1-3).
 *
 * v2 대비 개선: v2는 대체 텍스트가 없었다(순수 장식 div). v3는 role="img" + 위치를
 * 말하는 aria-label을 얹는다. 채움 폭은 음수가 되지 않게 0으로 클램프한다(cur<low일 때
 * v2는 잘못된 음수 width를 냈다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import positionBarStyles from "./position-bar.css.js";

const clampPct = (v: number): number => {
  const n = Number(v) * 100;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
};
const round1 = (v: number): number => Math.round(v * 10) / 10;

export class JdPositionBar extends JdElement {
  static override tag = "jd-position-bar";
  static override props = {
    /** 구간 하단 (0~1) */
    low: { type: Number },
    /** 구간 상단 (0~1) */
    high: { type: Number },
    /** 현재 위치 (0~1) */
    cur: { type: Number },
    /** up | down — 색 방향 */
    tone: { type: String, default: "up", reflect: true },
  };

  declare low: number;
  declare high: number;
  declare cur: number;
  declare tone: string;

  #band!: HTMLDivElement;
  #fill!: HTMLDivElement;
  #marker!: HTMLDivElement;

  protected render(): void {
    adoptStyles(positionBarStyles);
    this.setAttribute("role", "img");

    // 입양(§3.3)
    const band = this.querySelector<HTMLDivElement>(":scope > .jd-position-bar__band");
    if (band) {
      this.#band = band;
      this.#fill = this.querySelector<HTMLDivElement>(":scope > .jd-position-bar__fill")!;
      this.#marker = this.querySelector<HTMLDivElement>(":scope > .jd-position-bar__marker")!;
    } else {
      const doc = this.ownerDocument;
      this.#band = doc.createElement("div");
      this.#band.className = "jd-position-bar__band";
      this.#fill = doc.createElement("div");
      this.#fill.className = "jd-position-bar__fill";
      this.#marker = doc.createElement("div");
      this.#marker.className = "jd-position-bar__marker";
      this.append(this.#band, this.#fill, this.#marker);
    }
    this.update();
  }

  protected override update(): void {
    const left = clampPct(this.low);
    const right = clampPct(this.high);
    const pos = clampPct(this.cur);

    this.#band.style.left = `${round1(left)}%`;
    this.#band.style.width = `${round1(Math.max(0, right - left))}%`;
    this.#fill.style.left = `${round1(left)}%`;
    this.#fill.style.width = `${round1(Math.max(0, pos - left))}%`;

    this.setAttribute(
      "aria-label",
      `구간 ${round1(left)}–${round1(right)}% 중 현재 ${round1(pos)}%`,
    );
  }
}
