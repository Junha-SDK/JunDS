/**
 * <jd-progress-steps> — 스텝 진행 표시 (v2 composites/Progress ProgressSteps).
 *
 * **파생 판단(§6 R12): jd-stepper 상속을 검토하고 접었다.** 골격은 닮았지만
 * 공개 표면이 충돌한다 — jd-stepper의 `current`는 0-base 인덱스이고 이쪽 v2
 * 표면은 1-base 단계 번호다(`current={2} total={4}` = 2단계 진행 중). 상속하면
 * 물려받은 프로퍼티의 **의미만 뒤집는** 꼴이라, 두 태그를 섞어 쓰는 화면에서
 * 조용한 off-by-one을 낳는다. 데이터 표면도 다르다(steps 객체 배열 vs total+labels).
 * 대신 jd-stepper가 세운 **접근성 관용구**(ol/li · aria-current · 숨김 상태 텍스트 ·
 * 연결선 aria-hidden)를 그대로 따른다 — 물려받을 값어치가 있던 것은 그쪽이다.
 *
 * v2 대비 교정 4건:
 *  1. **목록이 아니었다.** div 중첩뿐이라 "4단계 중 2단계"라는 이 위젯의 유일한
 *     정보가 AT에 없었다. v3는 `<ol>/<li>` + 현재 단계 `aria-current="step"`.
 *  2. **상태가 색으로만 있었다.** 완료/진행/예정이 배경색 차이뿐 — 색각 이상과
 *     스크린리더 양쪽에 미전달. 단계마다 시각적으로 숨긴 상태 텍스트를 붙인다.
 *  3. **연결선을 읽어줬다.** 빈 div가 접근성 트리에 남아 있었다 — aria-hidden.
 *  4. **선이 라벨 길이에 따라 내려앉았다.** items-center가 라벨까지 포함한 높이의
 *     한가운데를 잡았기 때문. v3는 선을 원의 중심 높이에 고정한다(css).
 *
 * labels는 복합 데이터라 property 전용 + `<script type="application/json">` 슬롯(§1.3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import progressStepsStyles from "./progress-steps.css.js";

/** v2 완료 체크 — 14×14 viewBox 그대로 */
const CHECK_SVG =
  `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M3 7.5l3 3 5-5" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

type StepStatus = "done" | "current" | "upcoming";

export class JdProgressSteps extends JdElement {
  static override tag = "jd-progress-steps";
  static override props = {
    /** 현재 단계 — **1-base**(v2 표면 승계). 0이면 아직 아무 단계도 시작 전 */
    current: { type: Number, default: 0, reflect: true },
    /** 전체 단계 수 */
    total: { type: Number, default: 0, reflect: true },
    /** 목록의 접근 이름 */
    label: { type: String },
    completedLabel: { type: String, default: "완료" },
    currentLabel: { type: String, default: "진행 중" },
    upcomingLabel: { type: String, default: "예정" },
  };

  declare current: number;
  declare total: number;
  declare label: string;
  declare completedLabel: string;
  declare currentLabel: string;
  declare upcomingLabel: string;

  #labels: string[] = [];
  #list!: HTMLOListElement;
  #built = -1;

  get labels(): string[] {
    return this.#labels;
  }
  set labels(v: string[]) {
    this.#labels = Array.isArray(v) ? v.map((s) => String(s)) : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(progressStepsStyles);
    this.#readJson();
    // 입양(§3.3)
    const list = this.querySelector<HTMLOListElement>(":scope > ol.jd-progress-steps__list");
    if (list) {
      this.#list = list;
      this.#built = list.children.length;
    } else {
      this.#list = document.createElement("ol");
      this.#list.className = "jd-progress-steps__list";
      this.append(this.#list);
    }
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (jd-radio-group 선례) */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as unknown;
      if (Array.isArray(parsed)) this.#labels = parsed.map((s) => String(s));
    } catch {
      console.warn("[junds] <jd-progress-steps> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** total이 없으면 labels 길이가 단계 수 — v2보다 관대하다(둘 중 하나만 줘도 그린다) */
  #count(): number {
    const n = Math.floor(Number(this.total));
    if (Number.isFinite(n) && n > 0) return n;
    return this.#labels.length;
  }

  #createRow(): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "jd-progress-steps__step";
    const marker = document.createElement("div");
    marker.className = "jd-progress-steps__marker";
    const circle = document.createElement("span");
    circle.className = "jd-progress-steps__circle";
    const label = document.createElement("span");
    label.className = "jd-progress-steps__label";
    const status = document.createElement("span");
    status.className = "jd-progress-steps__status";
    marker.append(circle, label, status);
    const line = document.createElement("span");
    line.className = "jd-progress-steps__line";
    line.setAttribute("aria-hidden", "true"); // 장식 — v2는 읽어줬다
    row.append(marker, line);
    return row;
  }

  #sync(count: number): void {
    if (this.#list.children.length === count) return;
    this.#list.textContent = "";
    for (let i = 0; i < count; i++) this.#list.append(this.#createRow());
  }

  protected override update(): void {
    const count = this.#count();
    if (count !== this.#built) {
      this.#built = count;
      this.#sync(count);
    }

    if (this.label) this.#list.setAttribute("aria-label", this.label);
    else this.#list.removeAttribute("aria-label");

    const currentRaw = Math.floor(Number(this.current));
    const current = Number.isFinite(currentRaw) ? currentRaw : 0;
    const rows = Array.from(this.#list.children) as HTMLLIElement[];

    rows.forEach((row, i) => {
      const step = i + 1; // v2와 같은 1-base
      const status: StepStatus =
        step < current ? "done" : step === current ? "current" : "upcoming";
      row.dataset.status = status;
      row.toggleAttribute("data-last", i === count - 1);
      if (status === "current") row.setAttribute("aria-current", "step");
      else row.removeAttribute("aria-current");

      // v2: 지난 단계만 체크, 현재·예정은 번호
      const circle = row.querySelector<HTMLElement>(".jd-progress-steps__circle")!;
      const mode = status === "done" ? "check" : "number";
      if (circle.dataset.mode !== mode) {
        circle.dataset.mode = mode;
        if (mode === "check") circle.innerHTML = CHECK_SVG;
        else circle.textContent = "";
      }
      if (mode === "number") circle.textContent = String(step);

      const labelEl = row.querySelector<HTMLElement>(".jd-progress-steps__label")!;
      const text = this.#labels[i] ?? "";
      labelEl.textContent = text;
      labelEl.hidden = !text;

      row.querySelector<HTMLElement>(".jd-progress-steps__status")!.textContent =
        status === "done"
          ? this.completedLabel
          : status === "current"
          ? this.currentLabel
          : this.upcomingLabel;

      // 마지막 단계 뒤에는 선이 없다
      row.querySelector<HTMLElement>(".jd-progress-steps__line")!.hidden = i === count - 1;
    });
  }
}
