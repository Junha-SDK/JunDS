/**
 * <jd-form-wizard> — 단계별 폼 마법사(스텝 폼) (v2 patterns/FormWizard).
 *
 * v2는 step 객체에 content(ReactNode)까지 담아 Context(useWizard)로 내려줬다. 바닐라는
 * **메타와 콘텐츠를 분리**한다: `steps`(title/description/validate)는 property/JSON 슬롯,
 * 각 단계 콘텐츠는 light DOM 자식 `[slot="step"]`(DOM 순서 = 단계 순서)로 두고 활성 단계만
 * 노출한다. 콘텐츠 내부 컨트롤의 input/change는 위임 수집해 data를 구성하고(v2 setData의
 * 자동화), setData()/data 표면도 병행 제공한다.
 *
 * - steps는 복합 데이터 → property 전용(§1.3). validate는 함수라 JSON 슬롯 불가 —
 *   JSON 슬롯은 title/description만 시드한다.
 * - a11y: 스텝 인디케이터는 aria-current로 활성 단계를, 완료 단계는 체크 아이콘으로 표시.
 * - 이벤트(§1.5): jd-step-change { current } · jd-complete { data }.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import formWizardStyles from "./form-wizard.css.js";

export interface JdWizardStep {
  title: string;
  description?: string;
  validate?: (data: Record<string, unknown>) => boolean | string;
}

const CHECK_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M3 7l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdFormWizard extends JdElement {
  static override tag = "jd-form-wizard";
  static override props = {
    prevLabel: { type: String, default: "이전" }, // attr: prev-label
    nextLabel: { type: String, default: "다음" }, // attr: next-label
    completeLabel: { type: String, default: "완료" }, // attr: complete-label
  };

  declare prevLabel: string;
  declare nextLabel: string;
  declare completeLabel: string;

  #steps: JdWizardStep[] = [];
  #data: Record<string, unknown> = {};
  #current = 0;
  #error: string | null = null;

  #stepper!: HTMLElement;
  #head!: HTMLElement;
  #title!: HTMLHeadingElement;
  #desc!: HTMLParagraphElement;
  #content!: HTMLElement;
  #errorEl!: HTMLParagraphElement;
  #prev!: HTMLButtonElement;
  #next!: HTMLButtonElement;
  #count!: HTMLSpanElement;
  #stepNodes: Element[] = [];
  #renderedSteps = -1;

  /* ── 복합 데이터 표면(property 전용) ─────────────────────────────── */

  get steps(): JdWizardStep[] {
    return this.#steps;
  }
  set steps(v: JdWizardStep[]) {
    this.#steps = Array.isArray(v) ? v : [];
    this.#renderedSteps = -1;
    this.requestUpdate();
  }

  get data(): Record<string, unknown> {
    return this.#data;
  }
  set data(v: Record<string, unknown>) {
    this.#data = v && typeof v === "object" ? v : {};
    this.requestUpdate();
  }

  get current(): number {
    return this.#current;
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(formWizardStyles);
    this.#upgradeOwn("steps");
    this.#upgradeOwn("data");
    this.#readJson();

    const existing = this.querySelector<HTMLElement>(":scope > .jd-form-wizard");
    if (existing) {
      this.#stepper = existing.querySelector(".jd-form-wizard__stepper")!;
      this.#head = existing.querySelector(".jd-form-wizard__head")!;
      this.#title = this.#head.querySelector(".jd-form-wizard__title")!;
      this.#desc = this.#head.querySelector(".jd-form-wizard__desc")!;
      this.#content = existing.querySelector(".jd-form-wizard__content")!;
      this.#errorEl = existing.querySelector(".jd-form-wizard__error")!;
      this.#prev = existing.querySelector(".jd-form-wizard__prev")!;
      this.#next = existing.querySelector(".jd-form-wizard__next")!;
      this.#count = existing.querySelector(".jd-form-wizard__count")!;
      // 입양: 콘텐츠는 이미 컨테이너 안으로 이동돼 있다 — 거기서 단계 노드를 회수
      this.#stepNodes = Array.from(this.#content.children);
    } else {
      // 골격 구축 전 host 직계 자식에서 단계 노드를 회수(build가 컨테이너로 이동)
      this.#stepNodes = Array.from(this.children).filter((n) => n.getAttribute("slot") === "step");
      this.#build();
    }
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdWizardStep[];
      if (Array.isArray(parsed)) this.#steps = parsed;
    } catch {
      console.warn("[junds] <jd-form-wizard> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): void {
    const root = document.createElement("div");
    root.className = "jd-form-wizard";

    this.#stepper = document.createElement("div");
    this.#stepper.className = "jd-form-wizard__stepper";

    this.#head = document.createElement("div");
    this.#head.className = "jd-form-wizard__head";
    this.#title = document.createElement("h3");
    this.#title.className = "jd-form-wizard__title";
    this.#desc = document.createElement("p");
    this.#desc.className = "jd-form-wizard__desc";
    this.#head.append(this.#title, this.#desc);

    this.#content = document.createElement("div");
    this.#content.className = "jd-form-wizard__content";
    this.#content.append(...this.#stepNodes); // 콘텐츠 자식을 컨테이너로 이동

    this.#errorEl = document.createElement("p");
    this.#errorEl.className = "jd-form-wizard__error";
    this.#errorEl.setAttribute("role", "alert");

    const nav = document.createElement("div");
    nav.className = "jd-form-wizard__nav";
    this.#prev = document.createElement("button");
    this.#prev.type = "button";
    this.#prev.className = "jd-form-wizard__prev";
    this.#count = document.createElement("span");
    this.#count.className = "jd-form-wizard__count";
    this.#next = document.createElement("button");
    this.#next.type = "button";
    this.#next.className = "jd-form-wizard__next";
    nav.append(this.#prev, this.#count, this.#next);

    root.append(this.#stepper, this.#head, this.#content, this.#errorEl, nav);
    this.append(root);
  }

  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  protected override connected(): void {
    this.#prev.addEventListener("click", this.#onPrev);
    this.#next.addEventListener("click", this.#onNext);
    this.#stepper.addEventListener("click", this.#onStepperClick);
    this.#content.addEventListener("input", this.#onContentInput);
    this.#content.addEventListener("change", this.#onContentInput);
  }

  protected override disconnected(): void {
    this.#prev?.removeEventListener("click", this.#onPrev);
    this.#next?.removeEventListener("click", this.#onNext);
    this.#stepper?.removeEventListener("click", this.#onStepperClick);
    this.#content?.removeEventListener("input", this.#onContentInput);
    this.#content?.removeEventListener("change", this.#onContentInput);
  }

  /* ── data 자동 수집 ────────────────────────────────────────────────── */

  #onContentInput = (e: Event): void => {
    const el = e.target as HTMLInputElement | null;
    const name = el?.name;
    if (!name) return;
    this.#data[name] = el.type === "checkbox" ? el.checked : el.value;
  };

  /* ── 네비게이션 ───────────────────────────────────────────────────── */

  #clamp(i: number): number {
    return Math.max(0, Math.min(i, this.#steps.length - 1));
  }

  #onPrev = (): void => {
    this.prev();
  };
  #onNext = (): void => {
    this.next();
  };

  #onStepperClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest<HTMLButtonElement>(".jd-form-wizard__step");
    if (!btn || !this.#stepper.contains(btn)) return;
    const i = Number(btn.dataset.index);
    if (Number.isInteger(i) && i < this.#current) this.goTo(i);
  };

  next(): void {
    const step = this.#steps[this.#current];
    if (!step) return;
    if (step.validate) {
      const result = step.validate(this.#data);
      if (result !== true) {
        this.#error = typeof result === "string" ? result : "입력을 확인해주세요";
        this.requestUpdate();
        return;
      }
    }
    this.#error = null;
    if (this.#current < this.#steps.length - 1) {
      this.#current += 1;
      this.emit("jd-step-change", { current: this.#current });
      this.requestUpdate();
    } else {
      this.emit("jd-complete", { data: this.#data });
    }
  }

  prev(): void {
    this.#error = null;
    if (this.#current === 0) {
      this.requestUpdate();
      return;
    }
    this.#current -= 1;
    this.emit("jd-step-change", { current: this.#current });
    this.requestUpdate();
  }

  goTo(step: number): void {
    this.#error = null;
    const next = this.#clamp(step);
    if (next === this.#current) {
      this.requestUpdate();
      return;
    }
    this.#current = next;
    this.emit("jd-step-change", { current: this.#current });
    this.requestUpdate();
  }

  setData(key: string, value: unknown): void {
    this.#data[key] = value;
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    const total = this.#steps.length;
    const root = this.querySelector<HTMLElement>(":scope > .jd-form-wizard");
    if (root) root.hidden = total === 0;
    if (total === 0) return;

    this.#current = this.#clamp(this.#current);
    const active = this.#steps[this.#current]!;

    this.#syncStepper();

    this.#title.textContent = active.title;
    this.#desc.textContent = active.description ?? "";
    this.#desc.hidden = !active.description;

    // 활성 단계 콘텐츠만 노출
    this.#stepNodes.forEach((node, i) => {
      (node as HTMLElement).hidden = i !== this.#current;
    });

    this.#errorEl.textContent = this.#error ?? "";
    this.#errorEl.hidden = !this.#error;

    this.#prev.textContent = this.prevLabel;
    this.#prev.disabled = this.#current === 0;
    const isLast = this.#current === total - 1;
    this.#next.textContent = isLast ? this.completeLabel : this.nextLabel;
    this.#count.textContent = `${this.#current + 1} / ${total}`;
  }

  /** 스텝 인디케이터 — 개수가 바뀔 때만 재구축, 상태는 매번 동기화 */
  #syncStepper(): void {
    const total = this.#steps.length;
    if (this.#renderedSteps !== total) {
      this.#stepper.textContent = "";
      for (let i = 0; i < total; i++) {
        const seg = document.createElement("div");
        seg.className = "jd-form-wizard__seg";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "jd-form-wizard__step";
        btn.dataset.index = String(i);
        seg.append(btn);
        if (i < total - 1) {
          const line = document.createElement("div");
          line.className = "jd-form-wizard__line";
          seg.append(line);
        }
        this.#stepper.append(seg);
      }
      this.#renderedSteps = total;
    }

    const segs = this.#stepper.children;
    for (let i = 0; i < total; i++) {
      const seg = segs[i] as HTMLElement | undefined;
      if (!seg) continue;
      const btn = seg.querySelector<HTMLButtonElement>(".jd-form-wizard__step")!;
      const line = seg.querySelector<HTMLElement>(".jd-form-wizard__line");
      const state = i < this.#current ? "done" : i === this.#current ? "current" : "todo";
      btn.dataset.state = state;
      btn.disabled = i >= this.#current;
      btn.innerHTML = state === "done" ? CHECK_SVG : String(i + 1);
      const stepMeta = this.#steps[i];
      btn.setAttribute("aria-label", `${i + 1}단계${stepMeta ? `: ${stepMeta.title}` : ""}`);
      if (i === this.#current) btn.setAttribute("aria-current", "step");
      else btn.removeAttribute("aria-current");
      if (line) line.dataset.state = i < this.#current ? "done" : "todo";
    }
  }
}
