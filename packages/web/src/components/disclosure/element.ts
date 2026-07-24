/**
 * <jd-disclosure> — 단일 개폐 패널의 **원형** (v2 composites/Disclosure).
 *
 * v2는 Disclosure·Collapsible·Accordion이 **각자** 열림 상태·aria 배선·
 * grid-rows 애니메이션을 다시 구현했다 — Disclosure만 id·aria-controls·region이
 * 있었고(Collapsible은 aria-expanded만, 연결 대상이 없었다), Accordion은
 * 트리거 안에 아이콘·제목을 직접 배치하면서 같은 골격을 3번째로 복제했다.
 * v3는 그 전부를 이 원형 하나가 갖는다(§6 R12 — Modal→Drawer 선례):
 *   - jd-collapsible: 태그만 다른 별칭 파생(스킨 CSS만 재정의)
 *   - jd-accordion:   행마다 <jd-disclosure> 골격을 **입양 규칙(§3.3)으로** 미리 그려
 *                     넘긴다 — 개폐·키보드·aria를 다시 구현하지 않는다
 *
 * 슬롯 규약(§1.3 — ReactNode 프롭을 attribute로 실을 수 없다):
 *   [slot="trigger"] → 트리거 · 나머지 children → 패널 본문.
 *   `trigger` 문자열 프롭은 짧은 라벨용 지름길(v2 Collapsible trigger 프롭 대응).
 *
 * v2 대비 개선 3건:
 *  1. **버튼 안의 버튼을 만들지 않는다.** v2 Collapsible은 `<button>{trigger}</button>`로
 *     감쌌기 때문에 trigger에 버튼·링크를 넣으면 중첩 대화형 요소가 됐다. 여기서는
 *     트리거 슬롯 안에 포커스 가능 요소가 있으면 래퍼를 중립 span으로 만들고 그
 *     요소를 실효 트리거로 삼는다(jd-popover의 control 규칙과 동형).
 *  2. **닫힌 본문이 탭 순서·AT에서 빠진다.** v2 Collapsible/Accordion은 grid-rows를
 *     0fr로 접기만 해서 접힌 패널 안의 링크·버튼에 Tab이 그대로 들어갔다. v3는
 *     CSS `visibility`(전이 지연으로 애니메이션 보존) + `inert`(스타일시트 없이도
 *     동작하는 안전망)를 함께 건다.
 *  3. **forceMount는 이식하지 않는다.** v2의 forceMount=false는 "닫히면 언마운트"를
 *     뜻했는데 light DOM에서는 children이 곧 소비자의 노드다 — 지웠다 되살릴 수 없다.
 *     닫힘의 의미(AT·탭 순서에서 제외)는 위 2번이 그대로 제공한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { on } from "../../behaviors/input.js";
import disclosureStyles from "./disclosure.css.js";

/** 트리거 슬롯 안에서 "이미 포커스 가능한" 요소 — 래퍼를 button으로 만들지 가른다 */
const FOCUSABLE =
  "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled])," +
  'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export class JdDisclosure extends JdElement {
  static override tag = "jd-disclosure";
  static override props = {
    open: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    /** 트리거 라벨 지름길 — [slot="trigger"] children과 병용 가능(라벨이 앞에 온다) */
    trigger: { type: String },
    /** 트리거 접근 이름 재정의 (v2 Collapsible의 aria-label 프롭) */
    label: { type: String },
  };

  declare open: boolean;
  declare disabled: boolean;
  declare trigger: string;
  declare label: string;

  #trigger: HTMLElement | null = null;
  #panel: HTMLElement | null = null;
  #wasOpen = false;
  #offs: Array<() => void> = [];

  /* ── 파생 훅 ─────────────────────────────────────────────── */

  /** 패널 role. v2 Accordion·Disclosure 모두 region이었다 */
  protected get panelRole(): string {
    return "region";
  }
  protected get triggerEl(): HTMLElement | null {
    return this.#trigger;
  }
  protected get panelEl(): HTMLElement | null {
    return this.#panel;
  }
  /** 실효 트리거 — 래퍼 안의 진짜 포커스 가능 요소가 있으면 그것 (jd-popover 선례) */
  protected get control(): HTMLElement {
    const t = this.#trigger;
    if (!t) return this;
    if (t.matches(FOCUSABLE)) return t;
    return t.querySelector<HTMLElement>(FOCUSABLE) ?? t;
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(disclosureStyles);
    // 입양 규칙(§3.3): 프리렌더·어댑터·jd-accordion이 그린 골격 위에서 재구축하지 않는다
    let trigger = this.querySelector<HTMLElement>(":scope > .jd-disclosure__trigger");
    let panel = this.querySelector<HTMLElement>(":scope > .jd-disclosure__panel");
    if (!trigger || !panel) {
      const parts = this.#classify();
      trigger = this.#buildTrigger(parts.trigger);
      panel = document.createElement("div");
      panel.className = "jd-disclosure__panel";
      const inner = document.createElement("div");
      inner.className = "jd-disclosure__inner";
      inner.append(...parts.content);
      panel.append(inner);
      this.append(trigger, panel);
    }
    this.#trigger = trigger;
    this.#panel = panel;
    // grid 0fr↔1fr 전이는 overflow:hidden 자식이 있어야 성립한다 — 입양 골격에 없으면 감싼다
    if (!panel.querySelector(":scope > .jd-disclosure__inner")) {
      const inner = document.createElement("div");
      inner.className = "jd-disclosure__inner";
      inner.append(...panel.childNodes);
      panel.append(inner);
    }
    const tag = (this.constructor as typeof JdDisclosure).tag;
    if (!panel.id) panel.id = jdUid(`${tag}-panel`);
    panel.setAttribute("role", this.panelRole);
    const control = this.control;
    if (!control.id) control.id = jdUid(`${tag}-trigger`);
    panel.setAttribute("aria-labelledby", control.id);
    this.update();
  }

  /** children을 트리거/본문으로 분류. 명시 슬롯이 항상 이긴다 (jd-popover 선례) */
  #classify(): { trigger: Node[]; content: Node[] } {
    const triggerNodes: Node[] = [];
    const contentNodes: Node[] = [];
    for (const node of Array.from(this.childNodes)) {
      const slot = node.nodeType === 1 ? (node as Element).getAttribute("slot") : null;
      if (slot === "trigger") triggerNodes.push(node);
      else contentNodes.push(node);
    }
    return { trigger: triggerNodes, content: contentNodes };
  }

  /** 포커스 가능 요소가 이미 있으면 중립 span, 없으면 진짜 <button> (v2 결함 1 교정) */
  #buildTrigger(nodes: Node[]): HTMLElement {
    const hasFocusable = nodes.some(
      (n) =>
        n.nodeType === 1 &&
        ((n as Element).matches(FOCUSABLE) || (n as Element).querySelector(FOCUSABLE) !== null),
    );
    let el: HTMLElement;
    if (hasFocusable) {
      el = document.createElement("span");
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      el = btn;
    }
    el.className = "jd-disclosure__trigger";
    el.append(...nodes);
    return el;
  }

  /* ── 수명주기 ─────────────────────────────────────────────── */

  protected override connected(): void {
    this.#offs.push(
      on(this as EventTarget, "click", this.#onClick as (e: never) => void),
      on(this as EventTarget, "keydown", this.#onKeydown as (e: never) => void),
    );
    // 재부모화 생존 규율(DEC-031-1): 재연결에서는 render()가 다시 돌지 않는다
    this.requestUpdate();
  }

  protected override disconnected(): void {
    for (const off of this.#offs) off();
    this.#offs = [];
  }

  protected override update(): void {
    const panel = this.#panel;
    const trigger = this.#trigger;
    if (!panel || !trigger) return;
    this.#syncLabel(trigger);
    const control = this.control;
    const state = this.open ? "open" : "closed";
    // v2 Disclosure의 data-state 표면 승계 — 소비자 CSS 훅이자 내부 스타일 훅
    this.dataset.state = state;
    trigger.dataset.state = state;
    panel.dataset.state = state;
    control.setAttribute("aria-expanded", String(this.open));
    control.setAttribute("aria-controls", panel.id);
    if (this.label) control.setAttribute("aria-label", this.label);
    else control.removeAttribute("aria-label");
    if (control instanceof HTMLButtonElement) control.disabled = this.disabled;
    else control.toggleAttribute("aria-disabled", this.disabled);
    // 닫힌 본문은 탭 순서·AT에서 빠진다 (CSS visibility와 이중 안전망 — v2 결함 2 교정)
    panel.toggleAttribute("inert", !this.open);
    if (this.open !== this.#wasOpen) this.#applyOpenChange(this.open);
  }

  /** trigger 문자열 프롭 → 트리거 첫머리 라벨 (jd-popover content 선례) */
  #syncLabel(trigger: HTMLElement): void {
    const existing = trigger.querySelector<HTMLElement>(":scope > .jd-disclosure__label");
    if (!this.trigger) {
      existing?.remove();
      return;
    }
    const label = existing ?? document.createElement("span");
    if (!existing) {
      label.className = "jd-disclosure__label";
      trigger.prepend(label);
    }
    label.textContent = this.trigger;
  }

  /* ── 공개 API ─────────────────────────────────────────────── */

  show(): void {
    if (!this.disabled) this.open = true;
  }
  hide(): void {
    this.open = false;
  }
  toggle(): void {
    if (this.open) this.hide();
    else this.show();
  }

  /* ── 전이 ────────────────────────────────────────────────── */

  /** 사후 통지(§1.5) — cancelable 아님. 취소 지점이 필요하면 트리거 click을 막는다 */
  #applyOpenChange(open: boolean): void {
    this.#wasOpen = open;
    this.emit(open ? "jd-open" : "jd-close");
  }

  #onClick = (e: MouseEvent): void => {
    const t = this.#trigger;
    if (!t || !t.contains(e.target as Node)) return;
    if (this.disabled) {
      e.preventDefault();
      return;
    }
    this.toggle();
  };

  /** 소비자가 [tabindex] div를 트리거로 넣은 경우의 활성화 경로 — 네이티브 요소면 무동작 */
  #onKeydown = (e: KeyboardEvent): void => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const control = this.control;
    if (e.target !== control) return;
    if (control instanceof HTMLButtonElement || control instanceof HTMLAnchorElement) return;
    e.preventDefault();
    if (!this.disabled) this.toggle();
  };
}
