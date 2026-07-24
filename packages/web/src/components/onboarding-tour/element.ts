/**
 * <jd-onboarding-tour> — 제품 투어. 스팟라이트 + 말풍선으로 단계별 첫 사용자 가이드
 * (v2 ds/patterns/OnboardingTour).
 *
 * **파생 판단(§6 R12): jd-modal extends를 검토하고 접었다.** 오버레이·ESC·백드롭·
 * 포커스 감금이라는 표면은 겹치지만 jd-modal은 열릴 때 body 스크롤을 잠근다 — 이 투어는
 * 반대로 매 단계 대상을 화면에 스크롤해 넣고(scrollIntoView) 스크롤에 맞춰 오버레이를
 * 다시 배치해야 하므로 스크롤 락과 정면으로 충돌한다. 또 jd-modal은 슬롯 children을
 * 패널로 이동하는데 이 컴포넌트는 슬롯이 없고 steps(데이터)로 구동된다. 그래서 모달을
 * 상속하는 대신, 모달과 같은 이벤트 어휘(jd-request-close(cancelable)→jd-open/jd-close)와
 * 공용 Behavior(createFocusTrap — §8이 Tour를 트랩 소비처로 명시)만 재사용한다.
 *
 * 좌표·측정 규율은 jd-spotlight 선례를 그대로 따른다:
 *  - render()는 **절대 측정하지 않는다**(§3.1-3). getBoundingClientRect는 connected()
 *    이후 #reposition에서만. 스팟은 뷰포트 좌표(fixed 호스트 안 absolute)로 통일.
 *  - 스크롤/리사이즈 재배치는 createWindowSizeWatcher + capture scroll, 대상 크기 변화는
 *    createSizeObserver(v2엔 없던 추적).
 *
 * v2 대비 개선:
 *  1. **포커스 감금이 없었다.** v2는 root에 role=dialog·aria-modal을 붙였지만 포커스를
 *     안으로 옮기지도, Tab을 가두지도 않아 뒤 배경으로 탭 아웃됐다. v3는 말풍선에
 *     실제 createFocusTrap을 건다(§8 WEB-10). role=dialog·aria-modal도 스크림(root)이
 *     아니라 실제 대화 표면(말풍선)으로 옮기고, 제목을 aria-labelledby, 설명을
 *     aria-describedby로 묶는다.
 *  2. **단계 위치가 AT에 없었다.** "1 / N" 카운터는 순수 장식 텍스트였다. v3는 카운터에
 *     aria-label로 "N단계 중 M단계"를 준다.
 *  3. **말풍선 top 배치가 매직 넘버(-100)였다.** v3는 말풍선 실측 높이로 배치하고,
 *     네 방향 모두 뷰포트 안으로 clamp한다(v2는 화면 밖으로 넘칠 수 있었다).
 *  4. **매 스크롤마다 재센터링해 스크롤을 붙잡았다.** v2 update()가 스크롤/리사이즈에도
 *     scrollIntoView를 다시 불러 사용자 스크롤과 싸웠다. v3는 scrollIntoView를 단계
 *     전환 시에만 1회, 스크롤/리사이즈에는 오버레이 위치만 갱신한다. reduced-motion이면
 *     smooth 대신 즉시 스크롤.
 *  5. 닫기(ESC·백드롭·건너뛰기·close())는 취소 가능한 jd-request-close를 먼저 발행 —
 *     소비자가 진행을 막을 수 있다(v2엔 veto 경로가 없었다).
 *
 * steps는 복합 데이터라 property 전용 + 자식 `<script type="application/json">`
 * 슬롯(§1.3 · jd-radio-group/jd-onboarding 선례). target 함수형은 property로만 받는다.
 *
 * 이벤트(§1.5):
 *  - `jd-open` — 열림 상태 변화 후(비취소)
 *  - `jd-change` {index, id, total} — 단계 진입(열림 초기 단계 포함)
 *  - `jd-request-close` {reason} (cancelable) — 닫기 요청. preventDefault 시 유지
 *  - `jd-close` — 닫힘 상태 변화 후(비취소)
 *  - `jd-finish` {total} — 마지막 단계에서 완료 확정(v2 onComplete)
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { on } from "../../behaviors/input.js";
import { createWindowSizeWatcher, createSizeObserver } from "../../behaviors/viewport.js";
import { createFocusTrap, type FocusTrap } from "../../behaviors/focus-trap.js";
import type { Behavior } from "../../behaviors/types.js";
import onboardingTourStyles from "./onboarding-tour.css.js";

export type JdTourPlacement = "top" | "bottom" | "left" | "right";

export interface JdTourStep {
  /** 단계 식별자 — jd-change detail로 전달 */
  id: string;
  /** 강조할 요소: CSS 셀렉터 또는 lazy-resolve 함수(함수형은 property로만) */
  target: string | (() => HTMLElement | null);
  title: string;
  description?: string;
  placement?: JdTourPlacement;
}

/** 대상↔말풍선 간격(px). v2 m=12 */
const MARGIN = 12;
/** 스팟 링 여백(px). v2 rect±6 */
const SPOT_PAD = 6;
/** 말풍선을 뷰포트 안으로 가두는 여백(px) */
const CLAMP = 8;
/** 대상 미해결 시 말풍선 코너 위치. v2 {top:24,left:24} */
const FALLBACK = 24;

export class JdOnboardingTour extends JdElement {
  static override tag = "jd-onboarding-tour";
  static override props = {
    open: { type: Boolean, reflect: true },
    /** 투어의 접근 이름 — 카운터 aria-label 문맥 (v2 aria-label "제품 투어") */
    label: { type: String, default: "제품 투어" },
    skipLabel: { type: String, default: "건너뛰기" },
    prevLabel: { type: String, default: "이전" },
    nextLabel: { type: String, default: "다음" },
    finishLabel: { type: String, default: "완료" },
    // steps(Array)는 property 전용(§1.3) — 아래 접근자로 선언
  };

  declare open: boolean;
  declare label: string;
  declare skipLabel: string;
  declare prevLabel: string;
  declare nextLabel: string;
  declare finishLabel: string;

  #steps: JdTourStep[] = [];
  #index = 0;

  #backdrop!: HTMLElement;
  #spot!: HTMLElement;
  #tooltip!: HTMLElement;
  #counter!: HTMLElement;
  #title!: HTMLElement;
  #desc!: HTMLElement;
  #skip!: HTMLButtonElement;
  #prev!: HTMLButtonElement;
  #next!: HTMLButtonElement;

  #trap: FocusTrap | null = null;
  #observed: Element | null = null;
  #targetObserver: Behavior | null = null;
  #offs: Array<() => void> = [];
  #live = false;
  #wasOpen = false;

  get steps(): JdTourStep[] {
    return this.#steps;
  }
  set steps(v: JdTourStep[]) {
    // 소비자 데이터를 몰래 바꾸지 않도록 얕게 복사(jd-onboarding 선례)
    this.#steps = Array.isArray(v) ? v.map((s) => ({ ...s })) : [];
    if (this.#index >= this.#steps.length) this.#index = Math.max(0, this.#steps.length - 1);
    this.requestUpdate();
  }

  /** 현재 단계 인덱스(0-base) */
  get index(): number {
    return this.#index;
  }

  get #currentStep(): JdTourStep | undefined {
    return this.#steps[this.#index];
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(onboardingTourStyles);
    this.#upgradeOwn("steps");
    this.#readJson();

    const tooltip = this.querySelector<HTMLElement>(":scope > .jd-onboarding-tour__tooltip");
    if (tooltip) {
      // 입양(§3.3) — SSR/프리렌더 골격 재사용
      this.#backdrop = this.querySelector(":scope > .jd-onboarding-tour__backdrop")!;
      this.#spot = this.querySelector(":scope > .jd-onboarding-tour__spot")!;
      this.#tooltip = tooltip;
      this.#counter = tooltip.querySelector(".jd-onboarding-tour__counter")!;
      this.#title = tooltip.querySelector(".jd-onboarding-tour__title")!;
      this.#desc = tooltip.querySelector(".jd-onboarding-tour__desc")!;
      this.#skip = tooltip.querySelector(".jd-onboarding-tour__skip")!;
      this.#prev = tooltip.querySelector(".jd-onboarding-tour__prev")!;
      this.#next = tooltip.querySelector(".jd-onboarding-tour__next")!;
    } else {
      this.#build();
    }

    this.update();
  }

  #build(): void {
    const mk = (tag: string, cls: string): HTMLElement => {
      const n = document.createElement(tag);
      n.className = cls;
      return n;
    };
    const mkBtn = (cls: string): HTMLButtonElement => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      return b;
    };

    this.#backdrop = mk("div", "jd-onboarding-tour__backdrop");
    this.#spot = mk("div", "jd-onboarding-tour__spot");
    this.#spot.setAttribute("aria-hidden", "true"); // 순수 장식 — 내용은 말풍선에 있다
    this.#spot.hidden = true;

    this.#tooltip = mk("div", "jd-onboarding-tour__tooltip");
    this.#tooltip.setAttribute("role", "dialog");
    this.#tooltip.setAttribute("aria-modal", "true");
    this.#tooltip.tabIndex = -1;

    this.#counter = mk("div", "jd-onboarding-tour__counter");
    this.#title = mk("h2", "jd-onboarding-tour__title");
    this.#title.id = jdUid("jd-onboarding-tour-title");
    this.#desc = mk("div", "jd-onboarding-tour__desc");
    this.#desc.id = jdUid("jd-onboarding-tour-desc");

    const actions = mk("div", "jd-onboarding-tour__actions");
    this.#skip = mkBtn("jd-onboarding-tour__skip");
    const nav = mk("div", "jd-onboarding-tour__nav");
    this.#prev = mkBtn("jd-onboarding-tour__prev");
    this.#next = mkBtn("jd-onboarding-tour__next");
    nav.append(this.#prev, this.#next);
    actions.append(this.#skip, nav);

    this.#tooltip.append(this.#counter, this.#title, this.#desc, actions);
    this.append(this.#backdrop, this.#spot, this.#tooltip);
  }

  /** 업그레이드 전에 대입된 `steps`는 베이스 #upgradeProps 대상이 아니다(§1.3) */
  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  /** 선언적 초기화 슬롯 — 1회 소비(문자열 target만 표현 가능) */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as unknown;
      if (Array.isArray(parsed)) this.#steps = (parsed as JdTourStep[]).map((s) => ({ ...s }));
    } catch {
      console.warn("[junds] <jd-onboarding-tour> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /* ── 수명주기 ─────────────────────────────────────────────────────── */

  protected override connected(): void {
    this.#live = true;
    const view = this.ownerDocument.defaultView;
    if (view) {
      // capture — 내부 스크롤 컨테이너의 스크롤도 잡는다(jd-spotlight 동형)
      this.#offs.push(on(view, "scroll", this.#reposition as (e: never) => void, true));
    }
    const size = this.own(createWindowSizeWatcher());
    this.#offs.push(size.subscribe(this.#reposition));
    this.#offs.push(on(this.ownerDocument, "keydown", this.#onKeydown as (e: never) => void));

    this.#backdrop.addEventListener("click", this.#onBackdrop);
    this.#skip.addEventListener("click", this.#onSkip);
    this.#prev.addEventListener("click", this.#onPrev);
    this.#next.addEventListener("click", this.#onNext);

    this.#trap = this.own(
      createFocusTrap(this.#tooltip, { initialFocus: ".jd-onboarding-tour__next" }),
    );

    if (this.open && !this.#wasOpen) this.#applyOpenChange(true); // 최초/재연결 시 열림 활성
  }

  protected override disconnected(): void {
    for (const off of this.#offs) off();
    this.#offs = [];
    this.#targetObserver?.destroy();
    this.#targetObserver = null;
    this.#observed = null;
    // #live는 connected()에서만 켜진다 = render()가 골격을 세운 이후 = 아래 필드가 존재.
    // (연결 직후 render 전에 제거되면 골격이 없으므로 접근하지 않는다)
    if (this.#live) {
      this.#backdrop.removeEventListener("click", this.#onBackdrop);
      this.#skip.removeEventListener("click", this.#onSkip);
      this.#prev.removeEventListener("click", this.#onPrev);
      this.#next.removeEventListener("click", this.#onNext);
      // own()된 트랩은 베이스가 이미 destroy(=deactivate)했다 — 상태만 silent로 되돌린다
      if (this.#wasOpen) this.#applyOpenChange(false, { silent: true });
    }
    this.#live = false;
  }

  protected override update(): void {
    this.#syncContent(); // 텍스트/버튼 상태 — 결정적, 측정 없음
    if (!this.#live) return; // render() 안의 첫 update()는 여기서 멈춘다(§3.1-3)
    if (this.open !== this.#wasOpen) {
      this.#applyOpenChange(this.open);
      return;
    }
    if (this.open) this.#reposition(); // 라벨 등 프로퍼티 변경 시 위치 재확인(재스크롤 없음)
  }

  /* ── 상태 전이 ─────────────────────────────────────────────────────── */

  /** open 전이의 부수효과 1곳: 포커스트랩·단계 활성·사후 이벤트·인덱스 리셋 */
  #applyOpenChange(open: boolean, opts: { silent?: boolean } = {}): void {
    this.#wasOpen = open;
    if (open) {
      this.#trap?.activate();
      if (!opts.silent) this.emit("jd-open");
      this.#activateStep(); // 스크롤+측정+jd-change (§3.1-3: connected 이후에만 도달)
    } else {
      this.#trap?.deactivate();
      this.#hideOverlay();
      this.#targetObserver?.destroy();
      this.#targetObserver = null;
      this.#observed = null;
      if (!opts.silent) {
        this.emit("jd-close");
        this.#index = 0; // v2: open=false에서 0으로 리셋 → 다음 열림은 첫 단계부터
        this.#syncContent();
      }
    }
  }

  /** 단계 진입 — scrollIntoView는 여기서만 1회. 스크롤/리사이즈 재배치와 분리 */
  #activateStep(): void {
    const step = this.#currentStep;
    if (!step) {
      this.#hideOverlay();
      return;
    }
    const el = this.#resolve(step.target);
    if (el) {
      const behavior: ScrollBehavior = this.#prefersReducedMotion() ? "auto" : "smooth";
      el.scrollIntoView({ block: "center", behavior });
    }
    this.#reposition();
    this.emit("jd-change", { index: this.#index, id: step.id, total: this.#steps.length });
  }

  /** 측정+재배치 — connected 이후에만(§3.1-3). 대상/스크롤/리사이즈 변화에 재사용 */
  #reposition = (): void => {
    if (!this.#live || !this.open) return;
    const step = this.#currentStep;
    if (!step) {
      this.#hideOverlay();
      return;
    }
    const el = this.#resolve(step.target);
    this.#observe(el);
    const rect = el ? el.getBoundingClientRect() : null;
    this.#applyRect(rect, step.placement ?? "bottom");
  };

  #applyRect(rect: DOMRect | null, placement: JdTourPlacement): void {
    const spot = this.#spot;
    const tip = this.#tooltip;
    tip.hidden = false;
    if (!rect) {
      // 대상 미해결 — 스팟 없이 말풍선만 코너에(v2 동형)
      spot.hidden = true;
      tip.style.top = `${FALLBACK}px`;
      tip.style.left = `${FALLBACK}px`;
      return;
    }
    spot.hidden = false;
    spot.style.top = `${rect.top - SPOT_PAD}px`;
    spot.style.left = `${rect.left - SPOT_PAD}px`;
    spot.style.width = `${Math.max(0, rect.width + SPOT_PAD * 2)}px`;
    spot.style.height = `${Math.max(0, rect.height + SPOT_PAD * 2)}px`;

    const pos = this.#tooltipPos(rect, placement);
    tip.style.top = `${pos.top}px`;
    tip.style.left = `${pos.left}px`;
  }

  /** 말풍선 위치 — 실측 크기로 배치하고 뷰포트 안으로 clamp(v2 매직 -100/오버플로 교정) */
  #tooltipPos(rect: DOMRect, placement: JdTourPlacement): { top: number; left: number } {
    const view = this.ownerDocument.defaultView;
    const vw = view?.innerWidth ?? 0;
    const vh = view?.innerHeight ?? 0;
    const tw = this.#tooltip.offsetWidth;
    const th = this.#tooltip.offsetHeight;

    let top: number;
    let left: number;
    switch (placement) {
      case "top":
        top = rect.top - MARGIN - th;
        left = rect.left;
        break;
      case "left":
        top = rect.top;
        left = rect.left - tw - MARGIN;
        break;
      case "right":
        top = rect.top;
        left = rect.right + MARGIN;
        break;
      case "bottom":
      default:
        top = rect.bottom + MARGIN;
        left = rect.left;
        break;
    }
    left = Math.max(CLAMP, Math.min(left, vw - tw - CLAMP));
    top = Math.max(CLAMP, Math.min(top, vh - th - CLAMP));
    return { top, left };
  }

  #hideOverlay(): void {
    this.#spot.hidden = true;
    this.#tooltip.hidden = true;
  }

  #observe(el: Element | null): void {
    if (el === this.#observed) return;
    this.#targetObserver?.destroy();
    this.#targetObserver = null;
    this.#observed = el;
    if (el) this.#targetObserver = createSizeObserver(el, this.#reposition);
  }

  #resolve(target: JdTourStep["target"]): HTMLElement | null {
    if (!target) return null;
    if (typeof target === "function") return target();
    return this.ownerDocument.querySelector<HTMLElement>(target);
  }

  #prefersReducedMotion(): boolean {
    const view = this.ownerDocument.defaultView;
    return view?.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }

  /* ── 반영(결정적) ──────────────────────────────────────────────────── */

  #syncContent(): void {
    const total = this.#steps.length;
    if (this.#index >= total) this.#index = Math.max(0, total - 1);
    const step = this.#currentStep;
    const last = this.#index >= total - 1;

    this.#skip.textContent = this.skipLabel;
    this.#prev.textContent = this.prevLabel;
    this.#next.textContent = last ? this.finishLabel : this.nextLabel;
    this.#prev.hidden = this.#index === 0; // v2: index>0에서만 '이전' 노출

    this.#counter.textContent = total > 0 ? `${this.#index + 1} / ${total}` : "";
    this.#counter.setAttribute(
      "aria-label",
      total > 0 ? `${this.label}, ${total}단계 중 ${this.#index + 1}단계` : this.label,
    );

    const title = step?.title ?? "";
    this.#title.textContent = title;
    this.#title.hidden = !title;
    if (title) {
      this.#tooltip.setAttribute("aria-labelledby", this.#title.id);
      this.#tooltip.removeAttribute("aria-label");
    } else {
      this.#tooltip.removeAttribute("aria-labelledby");
      this.#tooltip.setAttribute("aria-label", this.label);
    }

    const desc = step?.description ?? "";
    this.#desc.textContent = desc;
    this.#desc.hidden = !desc;
    if (desc) this.#tooltip.setAttribute("aria-describedby", this.#desc.id);
    else this.#tooltip.removeAttribute("aria-describedby");
  }

  /* ── 이동/닫기 ─────────────────────────────────────────────────────── */

  #goTo(next: number): void {
    if (next < 0 || next >= this.#steps.length || next === this.#index) return;
    this.#index = next;
    this.#syncContent();
    if (this.#live && this.open) this.#activateStep();
  }

  /** 다음 단계 — 마지막이면 완료(jd-finish 후 닫힘) */
  next(): void {
    const total = this.#steps.length;
    if (total === 0) {
      this.close();
      return;
    }
    if (this.#index < total - 1) {
      this.#goTo(this.#index + 1);
    } else {
      this.emit("jd-finish", { total });
      this.open = false; // 완료는 취소 불가 — request-close 경유 안 함(v2 onComplete→onClose)
    }
  }

  /** 이전 단계 */
  prev(): void {
    if (this.#index > 0) this.#goTo(this.#index - 1);
  }

  /** 닫기 요청 — jd-request-close가 preventDefault되지 않으면 닫힌다 */
  close(): void {
    this.#requestClose("close");
  }

  #requestClose(reason: "escape" | "backdrop" | "skip" | "close"): void {
    if (!this.open) return;
    const proceed = this.emit("jd-request-close", { reason }, { cancelable: true });
    if (proceed) this.open = false; // → update()가 전이 부수효과 수행
  }

  #onBackdrop = (): void => this.#requestClose("backdrop");
  #onSkip = (): void => this.#requestClose("skip");
  #onPrev = (): void => this.prev();
  #onNext = (): void => this.next();

  #onKeydown = (e: KeyboardEvent): void => {
    if (!this.open) return;
    switch (e.key) {
      case "Escape":
        e.stopPropagation();
        this.#requestClose("escape");
        break;
      case "ArrowRight":
        e.preventDefault();
        this.next();
        break;
      case "ArrowLeft":
        if (this.#index > 0) {
          e.preventDefault();
          this.prev();
        }
        break;
      case "Enter": {
        // 말풍선 버튼에 포커스가 있으면 네이티브 클릭이 처리 — 중복 진행 방지.
        // (v2엔 포커스 트랩이 없어 Enter가 항상 전역 진행이었다 — 포커스가 버튼 밖일
        //  때는 여기서 그 동작을 유지한다)
        const t = e.target as Node | null;
        if (t && this.#tooltip.contains(t) && (t as Element).closest?.("button")) return;
        e.preventDefault();
        this.next();
        break;
      }
    }
  };
}
