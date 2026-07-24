/**
 * <jd-reading-goal> — 독서 목표 원형 진행률 (v2 composites/ReadingGoal).
 *
 * 링을 다시 그리지 않는다 — `<jd-progress-ring>`을 세우고 중앙에 `current/target` +
 * 단위를 슬롯한다(§6 R12 · jd-book-card→jd-book-cover 선례). 그 대가로 v2에 없던
 * SVG 방어(size<strokeWidth 음수 반지름 clamp)와 progressbar 접근성이 공짜로 붙는다.
 *
 * v2 대비 교정: v2 SVG는 role="progressbar"를 자기 자신이 가졌지만 값 텍스트가 중앙에
 * 이미 "23/50"으로 있었다 — 화면 라벨(목표 이름)은 위젯과 연결되지 않았다. v3는 링의
 * aria-label(목표 이름) + aria-valuetext(%)가 이름과 값을 함께 말하고, 아래 라벨은
 * 시각 보조로 남는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import readingGoalStyles from "./reading-goal.css.js";

const CLS = "jd-reading-goal";

export class JdReadingGoal extends JdElement {
  static override tag = "jd-reading-goal";
  static override props = {
    current: { type: Number, default: 0 },
    target: { type: Number, default: 0 },
    unit: { type: String, default: "권" },
    label: { type: String, default: "연간 목표" },
    /** 링 바깥 지름(px) */
    size: { type: Number, default: 140 },
    /** 선 두께(px) */
    thickness: { type: Number, default: 10 },
  };

  declare current: number;
  declare target: number;
  declare unit: string;
  declare label: string;
  declare size: number;
  declare thickness: number;

  #ring!: HTMLElement;
  #cur!: HTMLElement;
  #slash!: HTMLElement;
  #unit!: HTMLElement;
  #label!: HTMLElement;

  protected render(): void {
    adoptStyles(readingGoalStyles);
    // 슬롯 없는 데이터 컴포넌트 — SSR 골격이 있으면 지우고 새로 세운다(§3.3 멱등, 이중 방지)
    this.textContent = "";

    this.#cur = span(`${CLS}__cur`);
    this.#slash = span(`${CLS}__slash`);
    this.#unit = span(`${CLS}__unit`);
    const value = span(`${CLS}__value`);
    value.append(this.#cur, this.#slash);
    const center = document.createElement("div");
    center.className = `${CLS}__center`;
    center.append(value, this.#unit);

    this.#ring = document.createElement("jd-progress-ring");
    this.#ring.className = `${CLS}__ring`;
    this.#ring.append(center);

    this.#label = document.createElement("p");
    this.#label.className = `${CLS}__label`;

    this.append(this.#ring, this.#label);
    this.update();
  }

  protected override update(): void {
    // 링 위임 — 값/기하/이름은 progress-ring이 접근성까지 처리한다
    this.#ring.setAttribute("value", String(this.current));
    this.#ring.setAttribute("max", String(this.target));
    this.#ring.setAttribute("size", String(this.size));
    this.#ring.setAttribute("stroke-width", String(this.thickness));
    this.#ring.setAttribute("label", this.label || "연간 목표");

    this.#cur.textContent = String(this.current);
    this.#slash.textContent = `/${this.target}`;
    this.#unit.textContent = this.unit;
    this.#label.textContent = this.label || "연간 목표";
  }
}

function span(className: string): HTMLElement {
  const node = document.createElement("span");
  node.className = className;
  return node;
}
