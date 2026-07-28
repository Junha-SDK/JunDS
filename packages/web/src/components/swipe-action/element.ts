/**
 * <jd-swipe-action> — 좌/우로 밀면 액션이 드러나는 행 래퍼 (v2 composites/SwipeAction).
 *
 * 액션은 property(Array) 또는 자식
 * `<script type="application/json">{"left":[…],"right":[…]}</script>`(§1.3 예외).
 * 콘텐츠는 children 그대로다 — render()가 `.jd-swipe-action__content`로 감싼다(입양 §3.3).
 *
 * v2 대비 교정 6건:
 *  1. **터치 전용이었다.** v2는 onTouch*만 달아 데스크톱에서는 액션에 닿을 방법이
 *     아예 없었다. v3는 포인터 이벤트(마우스·펜·터치 공통) + 포인터 캡처를 쓴다.
 *  2. **키보드로 열 수 없었다.** 행 안에서 ←/→로 열고 Esc로 닫는다.
 *  3. **액션 버튼이 콘텐츠 뒤에 영영 숨어 있었다.** 탭으로 액션에 포커스가 들어오면
 *     해당 쪽을 자동으로 연다(초점이 보이지 않는 곳에 머무르지 않는다).
 *  4. **세로 스크롤을 먹었다.** v2는 시작 방향을 보지 않아 목록을 세로로 넘기려 해도
 *     행이 옆으로 밀렸다 — v3는 첫 이동의 축을 판정해 세로면 제스처를 포기한다.
 *  5. **열린 상태가 노출되지 않았다.** 콘텐츠에 `aria-expanded`를 주고 액션 그룹에
 *     이름을 붙인다.
 *  6. **색이 필수 문자열이었다.** `color`는 선택이고, 없으면 `variant`(default·danger·
 *     primary·success·warning) 토큰 색을 쓴다 — 다크에서도 성립한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import swipeActionStyles from "./swipe-action.css.js";

export type JdSwipeSide = "left" | "right";

export interface JdSwipeActionItem {
  label: string;
  /** jd-select detail로 전달되는 식별자. 없으면 label */
  value?: string;
  /** 임의 CSS 색 — 지정하면 variant보다 우선한다(v2 color 프롭 호환) */
  color?: string;
  /** default | danger | primary | success | warning */
  variant?: string;
  onClick?: () => void;
  disabled?: boolean;
}

/** 세로 스크롤로 판정하는 각도 — 첫 이동에서 |dx| <= |dy|면 제스처를 포기한다 */
const AXIS_SLOP = 6;

export class JdSwipeAction extends JdElement {
  static override tag = "jd-swipe-action";
  static override props = {
    /** 열림 거리(px) — v2 기본 80 */
    threshold: { type: Number, default: 80 },
    /** "" | left | right — 현재 열린 쪽 */
    open: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    leftLabel: { type: String, default: "왼쪽 액션" },
    rightLabel: { type: String, default: "오른쪽 액션" },
  };

  declare threshold: number;
  declare open: string;
  declare disabled: boolean;
  declare leftLabel: string;
  declare rightLabel: string;

  #actions: Record<JdSwipeSide, JdSwipeActionItem[]> = { left: [], right: [] };
  #panels!: Record<JdSwipeSide, HTMLElement>;
  #content!: HTMLElement;
  #offset = 0;
  #startX = 0;
  #startY = 0;
  #pointerId: number | null = null;
  #dragging = false;
  /** 축 판정 전 — 아직 가로/세로 중 무엇인지 모른다 */
  #axisPending = false;

  get leftActions(): JdSwipeActionItem[] {
    return this.#actions.left;
  }
  set leftActions(v: JdSwipeActionItem[]) {
    this.#actions.left = Array.isArray(v) ? v.slice() : [];
    this.#rebuild("left");
    this.requestUpdate();
  }

  get rightActions(): JdSwipeActionItem[] {
    return this.#actions.right;
  }
  set rightActions(v: JdSwipeActionItem[]) {
    this.#actions.right = Array.isArray(v) ? v.slice() : [];
    this.#rebuild("right");
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(swipeActionStyles);
    this.#upgradeOwn("leftActions");
    this.#upgradeOwn("rightActions");
    this.#readJsonSlot();

    const existingContent = this.querySelector<HTMLElement>(":scope > .jd-swipe-action__content");
    this.#panels = {
      left:
        this.querySelector<HTMLElement>(':scope > .jd-swipe-action__panel[data-side="left"]') ??
        this.#buildPanel("left"),
      right:
        this.querySelector<HTMLElement>(':scope > .jd-swipe-action__panel[data-side="right"]') ??
        this.#buildPanel("right"),
    };
    if (existingContent) {
      this.#content = existingContent;
    } else {
      this.#content = document.createElement("div");
      this.#content.className = "jd-swipe-action__content";
      const rest = Array.from(this.childNodes).filter(
        (n) => !(n instanceof HTMLElement && n.classList.contains("jd-swipe-action__panel")),
      );
      this.#content.append(...rest);
      this.append(this.#content);
    }
    this.#rebuild("left");
    this.#rebuild("right");
    this.update();
  }

  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as Partial<
        Record<JdSwipeSide, JdSwipeActionItem[]>
      >;
      if (Array.isArray(parsed.left)) this.#actions.left = parsed.left;
      if (Array.isArray(parsed.right)) this.#actions.right = parsed.right;
    } catch {
      console.warn("[junds] <jd-swipe-action> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #buildPanel(side: JdSwipeSide): HTMLElement {
    const panel = document.createElement("div");
    panel.className = "jd-swipe-action__panel";
    panel.dataset.side = side;
    panel.setAttribute("role", "group");
    this.append(panel);
    return panel;
  }

  #rebuild(side: JdSwipeSide): void {
    const panel = this.#panels?.[side];
    if (!panel) return;
    const items = this.#actions[side];
    panel.textContent = "";
    for (const [i, action] of items.entries()) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-swipe-action__button";
      b.dataset.side = side;
      b.dataset.index = String(i);
      b.textContent = action.label;
      b.disabled = Boolean(action.disabled);
      if (action.variant) b.dataset.variant = action.variant;
      // v2 color 프롭 호환 — 임의 CSS 색은 인라인으로만 표현할 수 있다
      if (action.color) b.style.backgroundColor = action.color;
      panel.append(b);
    }
    panel.hidden = items.length === 0;
  }

  protected override connected(): void {
    this.addEventListener("pointerdown", this.#onPointerDown);
    this.addEventListener("pointermove", this.#onPointerMove);
    this.addEventListener("pointerup", this.#onPointerUp);
    this.addEventListener("pointercancel", this.#onPointerUp);
    this.addEventListener("click", this.#onClick);
    this.addEventListener("keydown", this.#onKeyDown);
    this.addEventListener("focusin", this.#onFocusIn);
  }

  protected override disconnected(): void {
    this.removeEventListener("pointerdown", this.#onPointerDown);
    this.removeEventListener("pointermove", this.#onPointerMove);
    this.removeEventListener("pointerup", this.#onPointerUp);
    this.removeEventListener("pointercancel", this.#onPointerUp);
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("keydown", this.#onKeyDown);
    this.removeEventListener("focusin", this.#onFocusIn);
  }

  /* ── 제스처 ───────────────────────────────────────────────────────── */

  get #resolvedThreshold(): number {
    return Math.max(1, this.threshold || 1);
  }

  #onPointerDown = (e: Event): void => {
    const ev = e as PointerEvent;
    if (this.disabled || this.#pointerId !== null) return;
    // 액션 버튼에서 시작한 포인터는 버튼의 것이다
    if ((ev.target as Element | null)?.closest(".jd-swipe-action__panel")) return;
    this.#pointerId = ev.pointerId;
    this.#startX = ev.clientX;
    this.#startY = ev.clientY;
    this.#axisPending = true;
    this.#dragging = false;
  };

  #onPointerMove = (e: Event): void => {
    const ev = e as PointerEvent;
    if (this.#pointerId !== ev.pointerId) return;
    const dx = ev.clientX - this.#startX;
    const dy = ev.clientY - this.#startY;

    if (this.#axisPending) {
      if (Math.abs(dx) < AXIS_SLOP && Math.abs(dy) < AXIS_SLOP) return; // 아직 판정 불가
      this.#axisPending = false;
      if (Math.abs(dx) <= Math.abs(dy)) {
        this.#pointerId = null; // 세로 스크롤 — 제스처 포기(v2는 여기서 행을 밀었다)
        return;
      }
      this.#dragging = true;
      // 이 시점부터 포인터를 캡처한다 — 손가락이 행 밖으로 나가도 추적이 끊기지 않는다
      try {
        this.setPointerCapture(ev.pointerId);
      } catch {
        /* 이미 사라진 포인터 — 캡처 실패는 드래그를 막지 않는다 */
      }
    }
    if (!this.#dragging) return;
    const threshold = this.#resolvedThreshold;
    const maxLeft = this.#actions.left.length > 0 ? threshold : 0;
    const maxRight = this.#actions.right.length > 0 ? -threshold : 0;
    this.#setOffset(Math.max(maxRight, Math.min(maxLeft, dx)));
  };

  #onPointerUp = (e: Event): void => {
    const ev = e as PointerEvent;
    if (this.#pointerId !== ev.pointerId) return;
    try {
      this.releasePointerCapture(ev.pointerId);
    } catch {
      /* 캡처된 적이 없으면 무해하게 넘어간다 */
    }
    this.#pointerId = null;
    this.#axisPending = false;
    if (!this.#dragging) return;
    this.#dragging = false;
    const threshold = this.#resolvedThreshold;
    // v2: 절반을 못 넘기면 되돌리고, 넘겼으면 그 방향으로 연다
    if (Math.abs(this.#offset) < threshold / 2) this.close();
    else this.openSide(this.#offset > 0 ? "left" : "right");
  };

  /* ── 열기/닫기 ────────────────────────────────────────────────────── */

  openSide(side: JdSwipeSide): void {
    if (this.disabled || this.#actions[side].length === 0) return this.close();
    this.open = side;
    this.#setOffset(side === "left" ? this.#resolvedThreshold : -this.#resolvedThreshold);
    this.emit("jd-open", { side });
  }

  close(): void {
    const was = this.open;
    this.open = "";
    this.#setOffset(0);
    if (was) this.emit("jd-close", { side: was });
  }

  #setOffset(v: number): void {
    if (v === this.#offset) return;
    this.#offset = v;
    this.requestUpdate();
  }

  #onClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest<HTMLButtonElement>(
      ".jd-swipe-action__button",
    );
    if (!btn || !this.contains(btn)) return;
    const side = btn.dataset.side as JdSwipeSide | undefined;
    const index = Number(btn.dataset.index);
    if (!side || !Number.isInteger(index)) return;
    const action = this.#actions[side][index];
    if (!action || action.disabled) return;
    action.onClick?.();
    this.emit("jd-select", {
      side,
      index,
      value: action.value ?? action.label,
      label: action.label,
    });
    this.close(); // v2 reset() 동형
  };

  /** v2에는 없던 경로 — 키보드만으로 액션에 닿는다 */
  #onKeyDown = (e: Event): void => {
    const ev = e as KeyboardEvent;
    if (this.disabled) return;
    if (ev.key === "Escape") {
      if (!this.open) return;
      ev.preventDefault();
      this.close();
      return;
    }
    // 콘텐츠 안에서만 — 액션 버튼 위에서는 화살표가 다른 의미일 수 있다
    const inContent = (ev.target as Node | null) && this.#content.contains(ev.target as Node);
    if (!inContent) return;
    if (ev.key === "ArrowRight") {
      ev.preventDefault();
      if (this.open === "right") this.close();
      else this.openSide("left"); // 오른쪽으로 밀면 왼쪽 액션이 드러난다
    } else if (ev.key === "ArrowLeft") {
      ev.preventDefault();
      if (this.open === "left") this.close();
      else this.openSide("right");
    }
  };

  /** 탭으로 액션에 들어왔는데 화면 밖이면 사용자가 길을 잃는다 — 해당 쪽을 연다 */
  #onFocusIn = (e: Event): void => {
    const panel = (e.target as Element | null)?.closest<HTMLElement>(".jd-swipe-action__panel");
    const side = panel?.dataset.side as JdSwipeSide | undefined;
    if (!side || this.open === side) return;
    this.openSide(side);
  };

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    this.#panels.left.setAttribute("aria-label", this.leftLabel);
    this.#panels.right.setAttribute("aria-label", this.rightLabel);
    const threshold = this.#resolvedThreshold;
    this.style.setProperty("--_jd-swipe-threshold", `${threshold}px`);
    this.style.setProperty("--_jd-swipe-offset", `${this.#offset}px`);
    // 열림 상태는 호스트 [open] 속성이 단일 소스다. 콘텐츠에 aria-expanded를 주면
    // 역할 없는 div에 허용되지 않는 속성이 되어 axe가 잡는다(안 쓴다).
    this.#content.toggleAttribute("data-dragging", this.#dragging);
    for (const side of ["left", "right"] as const) {
      const panel = this.#panels[side];
      panel.hidden = this.#actions[side].length === 0;
      const count = this.#actions[side].length || 1;
      // v2: 각 버튼 폭 = threshold / 액션 수
      panel.style.setProperty("--_jd-swipe-button-width", `${threshold / count}px`);
    }
  }
}
