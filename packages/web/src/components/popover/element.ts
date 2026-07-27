/**
 * <jd-popover> — 앵커 상대 오버레이의 원형 (v2 composites/Popover).
 *
 * v2는 Popover·Tooltip·HoverCard·Dropdown·ContextMenu가 **각자** 열림 상태·지연
 * 타이머·바깥 클릭·방향 클래스표를 다시 구현했다(Popover만 클릭아웃, Tooltip만 지연,
 * HoverCard만 2단 지연, Dropdown만 화살표 내비, ESC는 Dropdown·ContextMenu만).
 * v3는 그 전부를 이 원형 하나가 갖고, 파생은 **표면(스킨)과 트리거 규칙만** 바꾼다
 * (§6 R12 — Modal→Drawer 선례). 파생 4종이 ESC·클릭아웃·포커스 복귀·요청형 닫기를
 * 공짜로 얻는다 — v2에는 어느 것도 전부 갖춘 컴포넌트가 없었다.
 *
 * 슬롯 규약(§1.3 — ReactNode 프롭을 attribute로 실을 수 없다):
 *   [slot="trigger"] → 트리거 · [slot="content"] → 패널 · 무슬롯 → defaultSlot 귀속.
 *   `content` 문자열 프롭은 짧은 텍스트 패널용 지름길(v2 Tooltip content 프롭 대응).
 *
 * 접근성(v2 대비 개선): v2 Dropdown은 트리거를 `<div role="button" tabIndex={0}>`로
 * 감싸 **버튼 안의 버튼**을 만들었다. 여기서는 트리거 래퍼 안의 실제 포커스 가능
 * 요소를 찾아 그 요소에 aria-*를 걸고, 없을 때만 래퍼를 합성 버튼으로 승격한다.
 *
 * 위치는 CSS만으로 잡는다(측정 없음) — render 단계 브라우저 API 금지(§3.1-3)와
 * 프리렌더 결정성을 동시에 지킨다. 뷰포트 클램프가 필요한 곳(ContextMenu)만
 * 이벤트 시점에 측정한다.
 */
import { JdElement } from "../../core/element.js";
import {
  syncAriaIdRefs,
  syncOwnedAttribute,
} from "../../core/aria.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createClickOutside, on } from "../../behaviors/input.js";
import { createTimeout } from "../../behaviors/timing.js";
import type { Timer } from "../../behaviors/timing.js";
import popoverStyles from "./popover.css.js";

export type JdPopoverSide = "top" | "bottom" | "left" | "right";
export type JdPopoverAlign = "left" | "center" | "right";
export type JdPopoverTriggerMode = "click" | "hover" | "contextmenu" | "manual";
export type JdPopoverCloseReason = "escape" | "outside" | "pointer" | "select" | "api";

/** 트리거 래퍼 안에서 "이미 포커스 가능한" 요소 — 합성 버튼 승격 여부를 가른다 */
const FOCUSABLE =
  "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled])," +
  'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export class JdPopover extends JdElement {
  static override tag = "jd-popover";
  static override props = {
    open: { type: Boolean, reflect: true },
    /** top | bottom | left | right — v2 side */
    side: { type: String, default: "bottom", reflect: true },
    /** left | center | right — v2 align. side가 left/right면 무시(수직 중앙 고정) */
    align: { type: String, default: "left", reflect: true },
    /** click | hover | contextmenu | manual */
    trigger: { type: String, default: "click", reflect: true },
    /** 짧은 텍스트 패널 지름길. 지정하면 무슬롯 children이 트리거가 된다 */
    content: { type: String },
    /** 패널의 접근 이름(aria-label) */
    label: { type: String },
    openDelay: { type: Number, default: 0 },
    closeDelay: { type: Number, default: 0 },
    disabled: { type: Boolean, reflect: true },
  };

  declare open: boolean;
  declare side: JdPopoverSide;
  declare align: JdPopoverAlign;
  declare trigger: JdPopoverTriggerMode;
  declare content: string;
  declare label: string;
  declare openDelay: number;
  declare closeDelay: number;
  declare disabled: boolean;

  #trigger: HTMLElement | null = null;
  #panel: HTMLElement | null = null;
  #ariaControl: HTMLElement | null = null;
  #wasOpen = false;
  #live = false;
  #offs: Array<() => void> = [];
  #offEsc: (() => void) | null = null;
  /** 지연 타이머는 own()에 넣지 않는다 — 호버 1회마다 죽은 Timer가 Set에 쌓인다 */
  #timer: Timer | null = null;

  /* ── 파생 훅 ─────────────────────────────────────────────── */

  /** 무슬롯 children의 귀속. content 프롭이 있으면 children은 트리거다 */
  protected get defaultSlot(): "trigger" | "content" {
    return this.content ? "trigger" : "content";
  }
  /** 패널 role. Tooltip=tooltip, Dropdown=menu */
  protected get panelRole(): string {
    return "dialog";
  }
  /** aria-haspopup 값. null이면 expanded 대신 aria-describedby 방식(Tooltip) */
  protected get ariaPopupType(): string | null {
    return "dialog";
  }
  /** 포커스 가능한 트리거가 없을 때 래퍼를 합성 버튼으로 승격할지 */
  protected get promoteTrigger(): boolean {
    return this.trigger === "click" || this.trigger === "hover";
  }
  protected get panelEl(): HTMLElement | null {
    return this.#panel;
  }
  protected get triggerEl(): HTMLElement | null {
    return this.#trigger;
  }
  /** 열림 직후 훅 — 패널은 이미 보이므로 측정·포커스가 가능하다 */
  protected opened(): void {}
  /** 닫힘 직후 훅 */
  protected closed(): void {}

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(popoverStyles);
    // 입양 규칙(§3.3): 프리렌더 산출물 위에서 재구축하지 않는다
    let trigger = this.querySelector<HTMLElement>(":scope > .jd-popover__trigger");
    let panel = this.querySelector<HTMLElement>(":scope > .jd-popover__panel");
    if (!trigger || !panel) {
      const parts = this.#classify();
      trigger = document.createElement("span");
      trigger.className = "jd-popover__trigger";
      trigger.append(...parts.trigger);
      panel = document.createElement("div");
      panel.className = "jd-popover__panel";
      panel.append(...parts.content);
      this.append(trigger, panel);
    }
    this.#trigger = trigger;
    this.#panel = panel;
    if (!panel.id) panel.id = jdUid(`${(this.constructor as typeof JdPopover).tag}-panel`);
    panel.setAttribute("role", this.panelRole);
    this.update();
  }

  /** children을 트리거/패널로 분류. 명시 슬롯이 항상 이긴다 */
  #classify(): { trigger: Node[]; content: Node[] } {
    const triggerNodes: Node[] = [];
    const contentNodes: Node[] = [];
    const fallback = this.defaultSlot;
    for (const node of Array.from(this.childNodes)) {
      const slot = node.nodeType === 1 ? (node as Element).getAttribute("slot") : null;
      if (slot === "trigger") triggerNodes.push(node);
      else if (slot === "content") contentNodes.push(node);
      else (fallback === "trigger" ? triggerNodes : contentNodes).push(node);
    }
    return { trigger: triggerNodes, content: contentNodes };
  }

  /* ── 수명주기 ─────────────────────────────────────────────── */

  protected override connected(): void {
    this.#live = true;
    this.own(createClickOutside(this, this.#onOutside));
    const host = this as EventTarget;
    this.#offs.push(
      on(host, "click", this.#onClick as (e: never) => void),
      on(host, "keydown", this.#onTriggerKeydown as (e: never) => void),
      on(host, "contextmenu", this.#onContextMenu as (e: never) => void),
      on(host, "mouseenter", this.#onEnter as (e: never) => void),
      on(host, "mouseleave", this.#onLeave as (e: never) => void),
      on(host, "focusin", this.#onFocusIn as (e: never) => void),
      on(host, "focusout", this.#onFocusOut as (e: never) => void),
    );
    if (this.#panel) this.#syncTriggerAria(this.#panel);
    // 재연결 복원 — render는 1회뿐이라 전이 부수효과를 여기서 되살린다(Modal 선례)
    if (this.open && !this.#wasOpen) this.#applyOpenChange(true);
  }

  protected override disconnected(): void {
    for (const off of this.#offs) off();
    this.#offs = [];
    this.#timer?.destroy();
    this.#timer = null;
    this.#clearTriggerAria();
    if (this.#wasOpen) this.#applyOpenChange(false, true);
    this.#live = false;
  }

  protected override update(): void {
    const panel = this.#panel;
    if (!panel) return;
    this.#syncContent(panel);
    syncOwnedAttribute(panel, "aria-label", this.label || null);
    panel.hidden = !this.open;
    this.#syncTriggerAria(panel);
    if (this.open !== this.#wasOpen) this.#applyOpenChange(this.open);
  }

  /** content 프롭 → 패널 첫머리 텍스트 노드(없으면 제거 — badge count 선례) */
  #syncContent(panel: HTMLElement): void {
    const existing = panel.querySelector<HTMLElement>(":scope > .jd-popover__label");
    if (!this.content) {
      existing?.remove();
      return;
    }
    const label = existing ?? document.createElement("span");
    if (!existing) {
      label.className = "jd-popover__label";
      panel.prepend(label);
    }
    label.textContent = this.content;
  }

  #syncTriggerAria(panel: HTMLElement): void {
    const control = this.control;
    if (this.#ariaControl && this.#ariaControl !== control) {
      this.#clearTriggerAria();
    }
    this.#ariaControl = control;
    if (control === this.#trigger && this.promoteTrigger) {
      // 포커스 가능한 자식이 없는 트리거 — 키보드 사용자에게 도달 경로를 준다
      if (!control.hasAttribute("tabindex")) control.tabIndex = 0;
      if (this.trigger === "click" && !control.hasAttribute("role")) {
        control.setAttribute("role", "button");
      }
    }
    const popup = this.ariaPopupType;
    if (popup) {
      syncOwnedAttribute(control, "aria-haspopup", popup);
      syncOwnedAttribute(control, "aria-expanded", String(this.open));
      syncAriaIdRefs(control, "aria-controls", panel.id);
      syncAriaIdRefs(control, "aria-describedby", null);
    } else {
      syncOwnedAttribute(control, "aria-haspopup", null);
      syncOwnedAttribute(control, "aria-expanded", null);
      syncAriaIdRefs(control, "aria-controls", null);
      // Tooltip 계열: 열려 있을 때만 서술 관계를 맺는다(hidden 요소 참조 금지)
      syncAriaIdRefs(
        control,
        "aria-describedby",
        this.open ? panel.id : null,
      );
    }
  }

  #clearTriggerAria(): void {
    const control = this.#ariaControl;
    if (!control) return;
    syncOwnedAttribute(control, "aria-haspopup", null);
    syncOwnedAttribute(control, "aria-expanded", null);
    syncAriaIdRefs(control, "aria-controls", null);
    syncAriaIdRefs(control, "aria-describedby", null);
    this.#ariaControl = null;
  }

  /** 실효 트리거 — 래퍼 안의 진짜 포커스 가능 요소가 있으면 그것 */
  protected get control(): HTMLElement {
    const wrapper = this.#trigger;
    if (!wrapper) return this;
    return wrapper.querySelector<HTMLElement>(FOCUSABLE) ?? wrapper;
  }

  /* ── 공개 API ─────────────────────────────────────────────── */

  show(): void {
    if (this.disabled) return;
    this.open = true;
  }
  hide(): void {
    this.requestClose("api");
  }
  toggle(): void {
    if (this.open) this.hide();
    else this.show();
  }
  /** Modal 표면과 이름 호환 */
  close(): void {
    this.hide();
  }
  /** 트리거로 포커스 복귀 — 닫기 경로 공통 */
  focusControl(): void {
    this.control.focus?.();
  }

  /** 요청형 닫기 — jd-request-close가 preventDefault되지 않으면 닫힌다(§1.5) */
  protected requestClose(reason: JdPopoverCloseReason): void {
    if (!this.open) return;
    if (this.emit("jd-request-close", { reason }, { cancelable: true })) this.open = false;
  }

  /* ── 전이 ────────────────────────────────────────────────── */

  #applyOpenChange(open: boolean, silent = false): void {
    this.#wasOpen = open;
    if (open) {
      this.#offEsc = on(this.ownerDocument, "keydown", this.#onDocKeydown as (e: never) => void);
      if (!silent) this.emit("jd-open");
      this.opened();
    } else {
      this.#offEsc?.();
      this.#offEsc = null;
      if (!silent) this.emit("jd-close");
      this.closed();
    }
  }

  /** 지연(openDelay/closeDelay)을 통과하는 상태 변경 — 마지막 의도만 남는다 */
  protected schedule(open: boolean, reason: JdPopoverCloseReason = "pointer"): void {
    const ms = open ? this.openDelay : this.closeDelay;
    this.#timer?.destroy();
    this.#timer = null;
    const run = (): void => {
      this.#timer = null;
      if (open) this.show();
      else this.requestClose(reason);
    };
    if (ms > 0) this.#timer = createTimeout(run, ms);
    else run();
  }

  /* ── 이벤트 ──────────────────────────────────────────────── */

  #onClick = (e: MouseEvent): void => {
    if (this.trigger !== "click" || this.disabled) return;
    if (this.#panel?.contains(e.target as Node)) return; // 패널 내부 클릭은 토글이 아니다
    this.toggle();
  };

  #onTriggerKeydown = (e: KeyboardEvent): void => {
    if (this.#panel?.contains(e.target as Node)) {
      this.panelKeydown(e);
      return;
    }
    if (this.disabled || this.trigger === "manual") return;
    this.triggerKeydown(e);
  };

  /** 트리거 위 키 입력 훅 — Dropdown이 ArrowDown 열기를 얹는다 */
  protected triggerKeydown(e: KeyboardEvent): void {
    if (this.trigger !== "click") return;
    // 합성 버튼(role=button span)은 Enter/Space를 스스로 click으로 바꾸지 못한다
    if (this.control === this.#trigger && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      this.toggle();
    }
  }

  /** 패널 내부 키 입력 훅 — Dropdown이 화살표 내비를 얹는다 */
  protected panelKeydown(_e: KeyboardEvent): void {}

  #onContextMenu = (e: MouseEvent): void => {
    if (this.trigger !== "contextmenu" || this.disabled) return;
    if (this.#panel?.contains(e.target as Node)) return;
    e.preventDefault();
    this.pointerOpen(e);
  };

  /** contextmenu 경로의 확장점 — 파생이 좌표를 기억한다 */
  protected pointerOpen(_e: MouseEvent): void {
    this.show();
  }

  #onEnter = (): void => {
    if (this.trigger !== "hover" || this.disabled) return;
    this.schedule(true);
  };

  #onLeave = (): void => {
    if (this.trigger !== "hover") return;
    this.schedule(false);
  };

  #onFocusIn = (): void => {
    // v2 Tooltip은 focus로 열렸고 HoverCard는 못 열렸다 — 키보드 경로를 통일한다
    if (this.trigger !== "hover" || this.disabled) return;
    this.schedule(true);
  };

  #onFocusOut = (e: FocusEvent): void => {
    if (this.trigger !== "hover") return;
    const next = e.relatedTarget as Node | null;
    // relatedTarget이 없으면 닫지 않는다: Safari는 포커스 불가 요소 클릭 시
    // relatedTarget=null로 blur를 쏘는데, 여기서 즉시 감추면 뒤이을 click이
    // 사라진 노드 위에서 증발한다(패널 안 버튼이 안 눌리는 실사고). 포인터 이탈은
    // mouseleave가, 창 이탈은 클릭아웃이 이미 담당한다.
    if (!next || this.contains(next)) return;
    this.schedule(false);
  };

  #onOutside = (): void => {
    if (!this.open || this.trigger === "manual") return;
    this.requestClose("outside");
  };

  #onDocKeydown = (e: KeyboardEvent): void => {
    if (e.key !== "Escape" || !this.open) return;
    e.stopPropagation();
    const hadFocus = this.contains(this.ownerDocument.activeElement);
    this.requestClose("escape");
    if (hadFocus) this.focusControl();
  };

  /** 연결 이후인지 — 파생이 측정·포커스 시점을 가릴 때 쓴다 */
  protected get live(): boolean {
    return this.#live;
  }
}
