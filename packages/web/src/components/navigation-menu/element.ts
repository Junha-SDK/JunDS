/**
 * <jd-navigation-menu> — 메가메뉴형 수평 내비게이션 (v2 composites/NavigationMenu).
 *
 * 항목은 property(Array) 또는 자식 `<script type="application/json">` 슬롯(§1.3).
 *
 * v2 결함 4건 교정:
 *  1. **키보드로 열 수 없었다.** v2는 onMouseEnter/onMouseLeave만 있었다 — 트리거가
 *     `<button>`인데 onClick도 없어, 마우스가 없으면 하위 메뉴에 도달할 방법이
 *     아예 없었다. v3는 APG Disclosure Navigation 패턴이다: 클릭 토글, ↓ 열고 첫
 *     항목 포커스, ↑/↓ 패널 안 순회, Home/End, ESC 닫고 트리거 복귀, 포커스 이탈 시 닫힘.
 *  2. **열림 상태가 AT에 전달되지 않았다.** v3는 `aria-expanded` + `aria-controls`로
 *     트리거와 패널을 결선하고, 패널에는 트리거를 가리키는 `aria-labelledby`를 준다.
 *  3. **닫기 타이머가 정리되지 않았다.** v2 timeoutRef는 언마운트 시 clear되지 않아
 *     사라진 컴포넌트의 setState가 예약된 채 남았다. v3는 debounce Behavior 1개를
 *     쓰고 disconnected에서 취소한다.
 *  4. **목록이 목록이 아니었다.** div 나열 → `<ul>/<li>` + 랜드마크(role=navigation).
 */
import { JdElement } from "../../core/element.js";
import {
  isContentEmpty,
  setContent,
  type JdContent,
} from "../../core/content.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createClickOutside, createKeyHandler } from "../../behaviors/input.js";
import { debounce } from "../../behaviors/timing.js";
import navigationMenuStyles from "./navigation-menu.css.js";

export interface JdNavMenuChild {
  key: string;
  label: string;
  description?: string;
  href: string;
  /** 아이콘. 문자열(평문), DOM 노드 또는 `unsafeHtml()`로 표시한 값 */
  icon?: JdContent;
}

export interface JdNavMenuItem {
  key: string;
  label: string;
  /** children이 없을 때만 쓰인다 — 링크로 렌더된다 */
  href?: string;
  children?: JdNavMenuChild[];
}

/** v2 트리거 셰브론 */
const CHEVRON_SVG =
  `<svg class="jd-navigation-menu__chevron" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="2" aria-hidden="true">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>`;

function fillIcon(slot: HTMLElement, icon: JdContent | undefined): void {
  if (isContentEmpty(icon)) {
    slot.hidden = true;
    setContent(slot, icon);
    return;
  }
  slot.hidden = false;
  setContent(slot, icon);
}

export class JdNavigationMenu extends JdElement {
  static override tag = "jd-navigation-menu";
  static override props = {
    /** 내비게이션 랜드마크 접근 이름 */
    label: { type: String, default: "주요 메뉴" },
    /** 포인터가 벗어난 뒤 닫히기까지의 유예. v2 기본 150ms */
    closeDelay: { type: Number, default: 150 },
  };

  declare label: string;
  declare closeDelay: number;

  #items: JdNavMenuItem[] = [];
  #built: readonly JdNavMenuItem[] | null = null;
  #list: HTMLUListElement | null = null;
  #openKey: string | null = null;
  #closeTimer: ((() => void) & { cancel(): void }) | null = null;
  #closeTimerMs = -1;

  get items(): JdNavMenuItem[] {
    return this.#items;
  }
  set items(v: JdNavMenuItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    this.#built = null;
    this.requestUpdate();
  }

  /** 현재 열린 항목 key (없으면 null) */
  get openKey(): string | null {
    return this.#openKey;
  }

  protected render(): void {
    adoptStyles(navigationMenuStyles);
    this.#readJson();
    this.setAttribute("role", "navigation");
    this.#list = this.querySelector<HTMLUListElement>(":scope > ul.jd-navigation-menu__list");
    if (!this.#list) {
      this.#list = document.createElement("ul");
      this.#list.className = "jd-navigation-menu__list";
      this.append(this.#list);
    }
    this.#sync();
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
    this.addEventListener("pointerover", this.#onPointerOver);
    this.addEventListener("pointerout", this.#onPointerOut);
    this.addEventListener("focusout", this.#onFocusOut);
    this.own(createClickOutside(this, () => this.#setOpen(null)));
    this.own(
      createKeyHandler(this, {
        escape: () => this.#onEscape(),
        arrowdown: () => this.#onArrow(1),
        arrowup: () => this.#onArrow(-1),
        home: () => this.#focusPanelEdge(1),
        end: () => this.#focusPanelEdge(-1),
      }),
    );
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("pointerover", this.#onPointerOver);
    this.removeEventListener("pointerout", this.#onPointerOut);
    this.removeEventListener("focusout", this.#onFocusOut);
    this.#closeTimer?.cancel();
    this.#openKey = null;
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdNavMenuItem[];
      if (Array.isArray(parsed)) this.#items = parsed;
    } catch {
      console.warn("[junds] <jd-navigation-menu> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  #rows(): HTMLLIElement[] {
    return this.#list ? (Array.from(this.#list.children) as HTMLLIElement[]) : [];
  }

  #hasChildren(item: JdNavMenuItem): boolean {
    return Array.isArray(item.children) && item.children.length > 0;
  }

  #sync(): void {
    this.#built = this.#items;
    const list = this.#list;
    if (!list) return;
    const rows = this.#rows();
    const shapeChanged =
      rows.length !== this.#items.length ||
      this.#items.some(
        (item, i) => rows[i]?.hasAttribute("data-has-children") !== this.#hasChildren(item),
      );
    if (shapeChanged) {
      list.textContent = "";
      for (const item of this.#items) list.append(this.#createRow(item));
    }
    this.#rows().forEach((row, i) => {
      const item = this.#items[i];
      if (!item) return;
      row.dataset.key = item.key;
      if (this.#hasChildren(item)) {
        const trigger = row.querySelector<HTMLButtonElement>(".jd-navigation-menu__trigger")!;
        trigger.querySelector<HTMLElement>(".jd-navigation-menu__label")!.textContent = item.label;
        this.#syncPanel(row, item);
      } else {
        const link = row.querySelector<HTMLAnchorElement>(".jd-navigation-menu__link")!;
        link.textContent = item.label;
        link.href = item.href ?? "#";
      }
    });
  }

  #syncPanel(row: HTMLLIElement, item: JdNavMenuItem): void {
    const panel = row.querySelector<HTMLElement>(".jd-navigation-menu__panel");
    if (!panel) return;
    const children = item.children ?? [];
    if (panel.children.length !== children.length) {
      panel.textContent = "";
      for (let i = 0; i < children.length; i++) panel.append(this.#createChild());
    }
    Array.from(panel.children).forEach((node, i) => {
      const child = children[i];
      if (!child) return;
      const link = node as HTMLAnchorElement;
      link.href = child.href;
      link.dataset.key = child.key;
      link.tabIndex = -1; // 패널은 열렸을 때만 탭 순서에 들어간다
      fillIcon(link.querySelector<HTMLElement>(".jd-navigation-menu__child-icon")!, child.icon);
      link.querySelector<HTMLElement>(".jd-navigation-menu__child-label")!.textContent = child.label;
      const desc = link.querySelector<HTMLElement>(".jd-navigation-menu__child-description")!;
      desc.textContent = child.description ?? "";
      desc.hidden = !child.description;
    });
  }

  #createRow(item: JdNavMenuItem): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "jd-navigation-menu__item";
    if (!this.#hasChildren(item)) {
      const link = document.createElement("a");
      link.className = "jd-navigation-menu__link";
      row.append(link);
      return row;
    }
    row.toggleAttribute("data-has-children", true);
    const panelId = jdUid("jd-navigation-menu-panel");
    const triggerId = jdUid("jd-navigation-menu-trigger");
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "jd-navigation-menu__trigger";
    trigger.id = triggerId;
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", panelId);
    const label = document.createElement("span");
    label.className = "jd-navigation-menu__label";
    trigger.append(label);
    trigger.insertAdjacentHTML("beforeend", CHEVRON_SVG);
    const panel = document.createElement("div");
    panel.className = "jd-navigation-menu__panel";
    panel.id = panelId;
    panel.setAttribute("aria-labelledby", triggerId);
    panel.hidden = true;
    row.append(trigger, panel);
    return row;
  }

  #createChild(): HTMLAnchorElement {
    const link = document.createElement("a");
    link.className = "jd-navigation-menu__child";
    const icon = document.createElement("span");
    icon.className = "jd-navigation-menu__child-icon";
    icon.setAttribute("aria-hidden", "true");
    const body = document.createElement("span");
    body.className = "jd-navigation-menu__child-body";
    const label = document.createElement("span");
    label.className = "jd-navigation-menu__child-label";
    const description = document.createElement("span");
    description.className = "jd-navigation-menu__child-description";
    body.append(label, description);
    link.append(icon, body);
    return link;
  }

  protected override update(): void {
    if (this.#built !== this.#items) this.#sync();
    this.setAttribute("aria-label", this.label);
    this.#applyOpen();
  }

  /* ── 열림 상태 ───────────────────────────────────────────── */

  #applyOpen(): void {
    for (const row of this.#rows()) {
      if (!row.hasAttribute("data-has-children")) continue;
      const open = row.dataset.key === this.#openKey;
      row.toggleAttribute("data-open", open);
      row.querySelector(".jd-navigation-menu__trigger")?.setAttribute("aria-expanded", String(open));
      const panel = row.querySelector<HTMLElement>(".jd-navigation-menu__panel");
      if (!panel) continue;
      panel.hidden = !open;
      for (const link of this.#childLinks(row)) link.tabIndex = open ? 0 : -1;
    }
  }

  /**
   * 열림 변경 — update()의 마이크로태스크를 기다리지 않고 즉시 DOM에 반영한다.
   * 열자마자 첫 항목에 포커스를 줘야 하는데 hidden 요소는 포커스를 받지 못한다.
   */
  #setOpen(key: string | null): void {
    if (this.#openKey === key) return;
    const prev = this.#openKey;
    this.#openKey = key;
    this.#applyOpen();
    if (key) this.emit("jd-open", { key });
    else if (prev) this.emit("jd-close", { key: prev });
  }

  #rowOf(key: string | null): HTMLLIElement | null {
    if (!key) return null;
    return this.#rows().find((row) => row.dataset.key === key) ?? null;
  }

  #childLinks(row: HTMLElement): HTMLAnchorElement[] {
    return Array.from(row.querySelectorAll<HTMLAnchorElement>(".jd-navigation-menu__child"));
  }

  /* ── 포인터 ──────────────────────────────────────────────── */

  #scheduleClose(): void {
    const ms = Math.max(0, Math.floor(this.closeDelay) || 0);
    if (!this.#closeTimer || this.#closeTimerMs !== ms) {
      this.#closeTimer?.cancel();
      this.#closeTimerMs = ms;
      this.#closeTimer = debounce(() => this.#setOpen(null), ms);
    }
    this.#closeTimer();
  }

  #onPointerOver = (e: Event): void => {
    const row = (e.target as Element | null)?.closest<HTMLLIElement>(".jd-navigation-menu__item");
    if (!row || !this.contains(row)) return;
    if (row.hasAttribute("data-has-children")) {
      this.#closeTimer?.cancel();
      this.#setOpen(row.dataset.key ?? null);
    } else if (this.#openKey) {
      this.#scheduleClose(); // v2: 하위 없는 항목으로 옮기면 열린 패널은 유예 후 닫힌다
    }
  };

  #onPointerOut = (e: Event): void => {
    const to = (e as PointerEvent).relatedTarget as Node | null;
    if (to && this.contains(to)) return;
    if (this.#openKey) this.#scheduleClose();
  };

  /* ── 클릭·포커스·키 ──────────────────────────────────────── */

  #onClick = (e: Event): void => {
    const target = e.target as Element | null;
    const child = target?.closest<HTMLAnchorElement>(".jd-navigation-menu__child");
    if (child && this.contains(child)) {
      const row = child.closest<HTMLLIElement>(".jd-navigation-menu__item");
      // 기본 동작(이동)은 막지 않는다 — 알림만 얹는다(§1.5)
      this.emit("jd-select", {
        key: child.dataset.key ?? "",
        parent: row?.dataset.key ?? "",
        href: child.href,
      });
      this.#setOpen(null);
      return;
    }
    const trigger = target?.closest(".jd-navigation-menu__trigger");
    if (!trigger || !this.contains(trigger)) return;
    const row = trigger.closest<HTMLLIElement>(".jd-navigation-menu__item");
    const key = row?.dataset.key ?? null;
    this.#closeTimer?.cancel();
    this.#setOpen(this.#openKey === key ? null : key);
  };

  #onFocusOut = (e: Event): void => {
    const to = (e as FocusEvent).relatedTarget as Node | null;
    if (to && this.contains(to)) return;
    this.#setOpen(null);
  };

  #onEscape(): void {
    const row = this.#rowOf(this.#openKey);
    this.#closeTimer?.cancel();
    this.#setOpen(null);
    row?.querySelector<HTMLButtonElement>(".jd-navigation-menu__trigger")?.focus();
  }

  /** ↓: 트리거에서는 열고 첫 항목으로, 패널 안에서는 다음 항목으로 */
  #onArrow(delta: 1 | -1): void {
    const active = this.ownerDocument.activeElement as HTMLElement | null;
    const row = active?.closest<HTMLLIElement>(".jd-navigation-menu__item");
    if (!row || !this.contains(row)) return;
    if (active?.classList.contains("jd-navigation-menu__trigger")) {
      if (delta !== 1) return;
      this.#closeTimer?.cancel();
      this.#setOpen(row.dataset.key ?? null);
      this.#childLinks(row)[0]?.focus();
      return;
    }
    const links = this.#childLinks(row);
    if (links.length === 0) return;
    const at = links.indexOf(active as HTMLAnchorElement);
    if (at < 0) return;
    links[(((at + delta) % links.length) + links.length) % links.length]?.focus();
  }

  #focusPanelEdge(dir: 1 | -1): void {
    const active = this.ownerDocument.activeElement as HTMLElement | null;
    const row = active?.closest<HTMLLIElement>(".jd-navigation-menu__item");
    if (!row || !this.contains(row) || !active?.classList.contains("jd-navigation-menu__child")) {
      return;
    }
    const links = this.#childLinks(row);
    (dir === 1 ? links[0] : links[links.length - 1])?.focus();
  }
}
