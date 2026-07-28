/**
 * <jd-onboarding> — 단계 체크리스트 카드 (v2 composites/Onboarding).
 *
 * **파생 판단(§6 R12): <jd-progress-bar> 합성을 검토하고 접었다.** 진행 표시의
 * 골격(트랙+채움)은 같지만 이 위젯이 필요한 것은 "5단계 중 2단계 완료"라는 고유
 * aria-valuetext와 **카드 제목을 진행바의 이름으로 묶는 연결**인데, jd-progress-bar는
 * 이름을 주는 유일한 통로인 `label`을 쓰면 자체 헤더를 그린다 — 카드 헤더와 이중이
 * 된다. 대신 jd-progress-bar가 세운 관용구(트랙이 progressbar · valuemin 명시 ·
 * aria-valuetext · 채움은 폭만 바꾼다)를 그대로 따랐다.
 *
 * 상태 소유(uncontrolled): v2는 `completed`를 부모가 쥐고 `onComplete(id)`만 받았다.
 * 바닐라에는 상태를 되돌려줄 부모가 없으므로 jd-star-rating 선례대로 **요소가
 * 상태를 소유**한다 — 단계를 누르면 스스로 완료로 넘기고 jd-change를 발행한다.
 * 소비자가 `el.steps = […]`를 다시 대입하면 그 값이 이긴다(마지막 쓰기 승리 §1.3).
 * 대입한 배열의 객체는 얕게 복사해 보관한다 — 소비자 데이터를 몰래 바꾸지 않는다.
 *
 * v2 대비 교정 4건:
 *  1. **목록이 아니었다.** div 나열이라 "몇 단계 중 몇 번째"가 AT에 없었다.
 *     v3는 `<ol>/<li>`.
 *  2. **진행바에 role이 없었다.** 폭만 바뀌는 장식 div여서 진행률이 전혀 전달되지
 *     않았다. v3는 트랙이 role=progressbar이고 제목이 그 이름이다.
 *  3. **완료 상태가 취소선(색)으로만 있었다.** 색각 이상·스크린리더 양쪽에 미전달.
 *     v3는 단계마다 시각적으로 숨긴 상태 텍스트를 붙인다(jd-progress-steps 관용구).
 *  4. **완료 단계가 아무 일도 안 하는 버튼으로 남았다.** v2는 완료 후에도 버튼을
 *     그대로 두고 핸들러에서만 무시했다 — 눌러도 반응 없는 컨트롤이다.
 *     v3는 aria-disabled="true"로 표시한다(포커스는 유지 — 완료 항목도 읽혀야 한다).
 *
 * steps는 복합 데이터라 property 전용 + 자식 `<script type="application/json">`
 * 슬롯(§1.3 · jd-radio-group 선례).
 *
 * 이벤트(§1.5):
 *  - `jd-change` {id, completed, completedCount, total} — 단계 완료 확정(v2 onComplete)
 *  - `jd-finish` — 완료 버튼 활성화(v2 onFinish)
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import onboardingStyles from "./onboarding.css.js";

export interface JdOnboardingStep {
  /** 단계 식별자 — jd-change detail로 전달 */
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
}

/** v2 체크 — 10×10 viewBox 그대로. 색은 CSS(currentColor)가 준다 */
const CHECK_SVG =
  `<svg viewBox="0 0 10 10" fill="none" aria-hidden="true">` +
  `<path d="M2 5l2.5 2.5L8 3" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdOnboarding extends JdElement {
  static override tag = "jd-onboarding";
  static override props = {
    /** 카드 제목 겸 진행바의 접근 이름 (v2 기본 "시작하기") */
    title: { type: String, default: "시작하기" },
    /** 전 단계 완료 시 나타나는 마무리 버튼 문구 */
    finishLabel: { type: String, default: "완료" },
    /** v2는 onFinish가 있을 때만 버튼을 그렸다 — 바닐라에서는 명시 opt-in */
    showFinish: { type: Boolean, reflect: true },
    completedLabel: { type: String, default: "완료됨" },
    pendingLabel: { type: String, default: "미완료" },
  };

  declare title: string;
  declare finishLabel: string;
  declare showFinish: boolean;
  declare completedLabel: string;
  declare pendingLabel: string;

  #steps: JdOnboardingStep[] = [];

  #header!: HTMLElement;
  #titleEl!: HTMLElement;
  #countEl!: HTMLElement;
  #track!: HTMLElement;
  #fill!: HTMLElement;
  #list!: HTMLOListElement;
  #finish!: HTMLButtonElement;

  get steps(): JdOnboardingStep[] {
    return this.#steps;
  }
  set steps(v: JdOnboardingStep[]) {
    this.#steps = Array.isArray(v) ? v.map((s) => ({ ...s })) : [];
    this.requestUpdate();
  }

  /** 완료된 단계 수 */
  get completedCount(): number {
    return this.#steps.reduce((n, s) => (s.completed ? n + 1 : n), 0);
  }

  /**
   * 프로그램 완료 — 클릭 경로와 같은 규칙(이미 완료면 무동작)을 쓴다.
   * @returns 상태가 실제로 바뀌었으면 true
   */
  complete(id: string): boolean {
    const step = this.#steps.find((s) => s.id === id);
    if (!step || step.completed) return false;
    step.completed = true;
    this.requestUpdate();
    this.#emitChange(step);
    return true;
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(onboardingStyles);
    this.#upgradeOwn("steps");
    this.#readJson();

    const list = this.querySelector<HTMLOListElement>(":scope > ol.jd-onboarding__list");
    if (list) {
      // 입양(§3.3) — SSR/프리렌더가 그린 골격 재사용
      this.#list = list;
      this.#header = this.querySelector(":scope > .jd-onboarding__header")!;
      this.#titleEl = this.#header.querySelector(".jd-onboarding__title")!;
      this.#countEl = this.#header.querySelector(".jd-onboarding__count")!;
      this.#track = this.querySelector(":scope > .jd-onboarding__track")!;
      this.#fill = this.#track.querySelector(".jd-onboarding__fill")!;
      this.#finish = this.querySelector(":scope > .jd-onboarding__finish")!;
    } else {
      this.#build();
    }

    this.update();
  }

  #build(): void {
    this.#titleEl = document.createElement("h3");
    this.#titleEl.className = "jd-onboarding__title";
    this.#titleEl.id = jdUid("jd-onboarding-title");
    this.#countEl = document.createElement("span");
    this.#countEl.className = "jd-onboarding__count";
    // 숫자 요약은 진행바의 aria-valuetext가 이미 말한다 — 눈에만 보이는 사본
    this.#countEl.setAttribute("aria-hidden", "true");
    this.#header = document.createElement("div");
    this.#header.className = "jd-onboarding__header";
    this.#header.append(this.#titleEl, this.#countEl);

    this.#fill = document.createElement("div");
    this.#fill.className = "jd-onboarding__fill";
    this.#track = document.createElement("div");
    this.#track.className = "jd-onboarding__track";
    this.#track.setAttribute("role", "progressbar");
    this.#track.setAttribute("aria-valuemin", "0");
    this.#track.append(this.#fill);

    this.#list = document.createElement("ol");
    this.#list.className = "jd-onboarding__list";

    this.#finish = document.createElement("button");
    this.#finish.type = "button";
    this.#finish.className = "jd-onboarding__finish";

    this.append(this.#header, this.#track, this.#list, this.#finish);
  }

  /** 업그레이드 전에 대입된 `steps`는 베이스의 #upgradeProps 대상이 아니다(§1.3) */
  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  /** 선언적 초기화 슬롯 — 1회 소비 */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as unknown;
      if (Array.isArray(parsed))
        this.#steps = (parsed as JdOnboardingStep[]).map((s) => ({ ...s }));
    } catch {
      console.warn("[junds] <jd-onboarding> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 리스너는 connected/disconnected 쌍으로 — render는 1회뿐이라 재연결에서 살아난다 */
  protected override connected(): void {
    this.#list.addEventListener("click", this.#onListClick);
    this.#finish.addEventListener("click", this.#onFinish);
  }

  protected override disconnected(): void {
    this.#list?.removeEventListener("click", this.#onListClick);
    this.#finish?.removeEventListener("click", this.#onFinish);
  }

  /* ── 이벤트 ────────────────────────────────────────────────────────── */

  #onListClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest<HTMLElement>(".jd-onboarding__button");
    if (!btn || !this.#list.contains(btn)) return;
    const row = btn.closest("li");
    if (!row) return;
    const i = Array.prototype.indexOf.call(this.#list.children, row);
    const step = this.#steps[i];
    if (!step || step.completed) return; // v2 동형: 완료 단계 클릭은 무동작
    step.completed = true;
    this.requestUpdate();
    this.#emitChange(step);
  };

  #onFinish = (): void => {
    this.emit("jd-finish", { completedCount: this.completedCount, total: this.#steps.length });
  };

  #emitChange(step: JdOnboardingStep): void {
    this.emit("jd-change", {
      id: step.id,
      completed: true,
      completedCount: this.completedCount,
      total: this.#steps.length,
    });
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  #buildRow(): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "jd-onboarding__step";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "jd-onboarding__button";

    const marker = document.createElement("span");
    marker.className = "jd-onboarding__marker";
    marker.setAttribute("aria-hidden", "true"); // 상태는 아래 숨김 텍스트가 전달
    marker.innerHTML = CHECK_SVG; // 체크는 항상 있고 CSS가 보임/숨김을 정한다

    const body = document.createElement("span");
    body.className = "jd-onboarding__body";
    const title = document.createElement("span");
    title.className = "jd-onboarding__step-title";
    const desc = document.createElement("span");
    desc.className = "jd-onboarding__desc";
    body.append(title, desc);

    const status = document.createElement("span");
    status.className = "jd-onboarding__status"; // 시각적으로 숨김 — CSS

    button.append(marker, body, status);
    row.append(button);
    return row;
  }

  protected override update(): void {
    const steps = this.#steps;
    const total = steps.length;
    const done = this.completedCount;
    const percent = total > 0 ? (done / total) * 100 : 0;

    this.#titleEl.textContent = this.title;
    this.#titleEl.hidden = !this.title;
    this.#countEl.textContent = `${done}/${total}`;

    this.#fill.style.width = `${percent}%`;
    this.#track.setAttribute("aria-valuemax", String(total));
    this.#track.setAttribute("aria-valuenow", String(done));
    this.#track.setAttribute("aria-valuetext", `${total}단계 중 ${done}단계 완료`);
    if (this.title) {
      this.#track.setAttribute("aria-labelledby", this.#titleEl.id);
      this.#track.removeAttribute("aria-label");
    } else {
      this.#track.removeAttribute("aria-labelledby");
      this.#track.setAttribute("aria-label", "진행률");
    }

    // 행 골격 재구축 판정은 **DOM에서 읽는다**(개수만) — 캐시 키를 쓰면 첫 update가
    // 무조건 재구축이라 SSR/프리렌더 골격 입양(§3.3)이 성립하지 않는다. 행 구조는
    // 전부 동일하고 내용은 아래 동기화 루프가 다시 쓴다.
    if (this.#list.childElementCount !== total) {
      this.#list.textContent = "";
      for (let i = 0; i < total; i++) this.#list.append(this.#buildRow());
    }

    steps.forEach((step, i) => {
      const row = this.#list.children[i] as HTMLLIElement;
      const completed = Boolean(step.completed);
      row.toggleAttribute("data-completed", completed);

      const button = row.querySelector<HTMLButtonElement>(".jd-onboarding__button")!;
      // 완료 단계는 눌러도 아무 일이 없다 — 포커스는 남기고 무동작임을 알린다
      if (completed) button.setAttribute("aria-disabled", "true");
      else button.removeAttribute("aria-disabled");

      row.querySelector<HTMLElement>(".jd-onboarding__step-title")!.textContent = step.title;
      const desc = row.querySelector<HTMLElement>(".jd-onboarding__desc")!;
      desc.textContent = step.description ?? "";
      desc.hidden = !step.description;
      row.querySelector<HTMLElement>(".jd-onboarding__status")!.textContent = completed
        ? this.completedLabel
        : this.pendingLabel;
    });

    this.#finish.textContent = this.finishLabel;
    this.#finish.hidden = !(this.showFinish && total > 0 && done === total);
  }
}
