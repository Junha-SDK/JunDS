/**
 * <jd-stepper> — 단계별 진행 표시 (v2 composites/Stepper).
 *
 * 단계는 property(Array) 또는 자식 `<script type="application/json">` 슬롯(§1.3).
 *
 * v2 대비 교정 3건:
 *  1. **의미가 0이었다.** v2는 div만으로 그려 AT에는 글자 몇 개로만 보였다 —
 *     "3단계 중 2단계"라는 이 컴포넌트의 유일한 정보가 전달되지 않았다. v3는
 *     `<ol>/<li>`(순서 있는 목록) + 현재 단계에 `aria-current="step"`.
 *  2. **상태가 색으로만 있었다.** 완료/진행 중/예정이 배경색 차이뿐이었다 —
 *     색각 이상·스크린리더 양쪽에 미전달. v3는 단계마다 시각적으로 숨긴 상태
 *     텍스트(`completedLabel`/`currentLabel`/`upcomingLabel`)를 함께 낸다.
 *  3. **연결선을 읽어줬다.** 빈 div가 접근성 트리에 남아 있었다 — aria-hidden.
 *
 * direction(horizontal/vertical) 분기는 호스트 속성 셀렉터가 담당한다(§4.3) —
 * v2가 JSX 안에서 삼항 6번으로 나눠 그리던 것이 CSS 한 벌로 접힌다.
 */
import { JdElement } from "../../core/element.js";
import { setContent, type JdContent } from "../../core/content.js";
import { adoptStyles } from "../../core/styles.js";
import stepperStyles from "./stepper.css.js";

export interface JdStep {
  /** 고유 키 — data-key로 노출된다 */
  key: string;
  title: string;
  description?: string;
  /** 아이콘. 주면 번호·완료 체크 대신 이것이 원 안에 들어간다 */
  icon?: JdContent;
}

type StepStatus = "completed" | "current" | "upcoming";

/** v2 완료 체크 아이콘 */
const CHECK_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;

function fillIcon(slot: HTMLElement, icon: JdContent | undefined): void {
  setContent(slot, icon);
}

export class JdStepper extends JdElement {
  static override tag = "jd-stepper";
  static override props = {
    /** 현재 단계 인덱스 (0-base) */
    current: { type: Number, default: 0, reflect: true },
    /** horizontal | vertical */
    direction: { type: String, default: "horizontal", reflect: true },
    /** 목록 접근 이름 */
    label: { type: String },
    completedLabel: { type: String, default: "완료" },
    currentLabel: { type: String, default: "진행 중" },
    upcomingLabel: { type: String, default: "예정" },
  };

  declare current: number;
  declare direction: string;
  declare label: string;
  declare completedLabel: string;
  declare currentLabel: string;
  declare upcomingLabel: string;

  #steps: JdStep[] = [];
  #built: readonly JdStep[] | null = null;
  #list: HTMLOListElement | null = null;

  get steps(): JdStep[] {
    return this.#steps;
  }
  set steps(v: JdStep[]) {
    this.#steps = Array.isArray(v) ? v : [];
    this.#built = null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(stepperStyles);
    this.#readJson();
    // 입양(§3.3)
    this.#list = this.querySelector<HTMLOListElement>(":scope > ol.jd-stepper__list");
    if (!this.#list) {
      this.#list = document.createElement("ol");
      this.#list.className = "jd-stepper__list";
      this.append(this.#list);
    }
    this.#sync();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdStep[];
      if (Array.isArray(parsed)) this.#steps = parsed;
    } catch {
      console.warn("[junds] <jd-stepper> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #rows(): HTMLLIElement[] {
    return this.#list ? (Array.from(this.#list.children) as HTMLLIElement[]) : [];
  }

  #sync(): void {
    this.#built = this.#steps;
    const list = this.#list;
    if (!list) return;
    if (list.children.length !== this.#steps.length) {
      list.textContent = "";
      for (let i = 0; i < this.#steps.length; i++) list.append(this.#createRow());
    }
    this.#rows().forEach((row, i) => {
      const step = this.#steps[i];
      if (!step) return;
      row.dataset.key = step.key;
      row.querySelector<HTMLElement>(".jd-stepper__title")!.textContent = step.title;
      const desc = row.querySelector<HTMLElement>(".jd-stepper__description")!;
      desc.textContent = step.description ?? "";
      desc.hidden = !step.description;
      // 원 안의 내용은 상태에도 의존한다 — update()가 다시 채우도록 표식을 지운다
      delete row.querySelector<HTMLElement>(".jd-stepper__circle")!.dataset.mode;
      row.toggleAttribute("data-last", i === this.#steps.length - 1);
    });
  }

  #createRow(): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "jd-stepper__step";
    const marker = document.createElement("span");
    marker.className = "jd-stepper__marker";
    const circle = document.createElement("span");
    circle.className = "jd-stepper__circle";
    const line = document.createElement("span");
    line.className = "jd-stepper__line";
    line.setAttribute("aria-hidden", "true");
    marker.append(circle, line);
    const body = document.createElement("span");
    body.className = "jd-stepper__body";
    const title = document.createElement("span");
    title.className = "jd-stepper__title";
    const description = document.createElement("span");
    description.className = "jd-stepper__description";
    const status = document.createElement("span");
    status.className = "jd-stepper__status";
    body.append(title, description, status);
    row.append(marker, body);
    return row;
  }

  protected override update(): void {
    if (this.#built !== this.#steps) this.#sync();
    if (this.label) this.#list?.setAttribute("aria-label", this.label);
    else this.#list?.removeAttribute("aria-label");
    const current = Math.floor(this.current) || 0;
    this.#rows().forEach((row, i) => {
      const step = this.#steps[i];
      if (!step) return;
      const status: StepStatus = i < current ? "completed" : i === current ? "current" : "upcoming";
      row.dataset.status = status;
      if (status === "current") row.setAttribute("aria-current", "step");
      else row.removeAttribute("aria-current");
      row.querySelector<HTMLElement>(".jd-stepper__status")!.textContent =
        status === "completed"
          ? this.completedLabel
          : status === "current"
          ? this.currentLabel
          : this.upcomingLabel;
      this.#applyCircle(row.querySelector<HTMLElement>(".jd-stepper__circle")!, step, status, i);
    });
  }

  /** 아이콘 > 완료 체크 > 번호 순. mode 표식으로 불필요한 재파싱을 막는다 */
  #applyCircle(circle: HTMLElement, step: JdStep, status: StepStatus, index: number): void {
    const mode = step.icon ? "icon" : status === "completed" ? "check" : "number";
    if (circle.dataset.mode !== mode) {
      circle.dataset.mode = mode;
      circle.textContent = "";
      if (mode === "icon") fillIcon(circle, step.icon);
      else if (mode === "check") circle.innerHTML = CHECK_SVG;
    }
    if (mode === "number") circle.textContent = String(index + 1);
  }
}
