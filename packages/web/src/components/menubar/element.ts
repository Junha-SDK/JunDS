/**
 * <jd-menubar> — macOS 풍 메뉴 바 (v2 composites/Menubar).
 *
 * 항목 렌더·구분선·단축키·화살표 내비는 jd-dropdown이 소유한 메뉴 원형
 * (buildMenuList/handleMenuKeydown + `.jd-dropdown__*`)을 그대로 쓴다(§6 R12).
 * 파생(extends)이 아니라 **함수 재사용**인 이유: 메뉴바는 패널 1개가 아니라 N개를
 * 거느리는 컨테이너라 상속 관계가 성립하지 않는다. jd-dropdown 요소를 안에서
 * 생성하는 방법도 있으나, element.ts만 import한 소비자에게는 미정의 태그가 되어
 * 죽은 마크업이 남는다(부작용 0 규칙과 상충) — 그래서 함수만 빌려온다.
 *
 * v2 대비 개선:
 *  - **키보드로 쓸 수 있다.** v2 Menubar에는 키 핸들러가 하나도 없었다(클릭·호버 전용).
 *    여기서는 APG Menubar 패턴대로 ←/→ 로빙 tabindex, ↓/↑ 메뉴 열기, Home/End,
 *    메뉴 안 ↑/↓ 순회, ESC 닫고 버튼 복귀, Tab 이탈 시 닫기.
 *  - role=menubar / menuitem / menu + aria-expanded·aria-controls 결선.
 *  - 바깥 클릭 해제를 문서 리스너 수기 등록 대신 createClickOutside Behavior로.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createClickOutside, on } from "../../behaviors/input.js";
import {
  buildMenuList,
  focusMenuItem,
  handleMenuKeydown,
  readJsonSlot,
  type JdMenuItem,
} from "../dropdown/element.js";
import dropdownStyles from "../dropdown/dropdown.css.js";
import menubarStyles from "./menubar.css.js";

export interface JdMenubarMenu {
  key: string;
  label: string;
  items: JdMenuItem[];
}

export class JdMenubar extends JdElement {
  static override tag = "jd-menubar";
  static override props = {
    /** 메뉴 바의 접근 이름 */
    label: { type: String, default: "메뉴 바" },
  };

  declare label: string;

  #menus: JdMenubarMenu[] = [];
  #built: readonly JdMenubarMenu[] | null = null;
  #openKey: string | null = null;
  #offs: Array<() => void> = [];

  get items(): JdMenubarMenu[] {
    return this.#menus;
  }
  /** 배열을 **새로 대입**해야 반영된다(제자리 변형은 감지하지 않는다) */
  set items(v: JdMenubarMenu[]) {
    this.#menus = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(dropdownStyles); // 항목 스타일 원형
    adoptStyles(menubarStyles);
    const parsed = readJsonSlot<JdMenubarMenu>(this);
    if (parsed) this.#menus = parsed;
    this.setAttribute("role", "menubar");
    this.update();
  }

  protected override connected(): void {
    this.own(createClickOutside(this, this.#onOutside));
    const host = this as EventTarget;
    this.#offs.push(
      on(host, "click", this.#onClick as (e: never) => void),
      on(host, "mouseover", this.#onHover as (e: never) => void),
      on(host, "keydown", this.#onKeydown as (e: never) => void),
    );
  }

  protected override disconnected(): void {
    for (const off of this.#offs) off();
    this.#offs = [];
    this.#openKey = null;
  }

  protected override update(): void {
    this.setAttribute("aria-label", this.label);
    this.#syncGroups();
    this.#applyOpen();
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  #groups(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(":scope > .jd-menubar__group"));
  }
  #buttonOf(group: HTMLElement): HTMLButtonElement | null {
    return group.querySelector<HTMLButtonElement>(":scope > .jd-menubar__button");
  }
  #menuOf(group: HTMLElement): HTMLElement | null {
    return group.querySelector<HTMLElement>(":scope > .jd-menubar__menu");
  }

  #syncGroups(): void {
    if (this.#built === this.#menus) return;
    this.#built = this.#menus;
    const existing = this.#groups();
    // 입양(§3.3): 개수가 같으면 골격을 다시 만들지 않고 내용만 맞춘다
    if (existing.length !== this.#menus.length) {
      for (const group of existing) group.remove();
      for (const menu of this.#menus) this.append(this.#createGroup(menu));
    }
    this.#groups().forEach((group, i) => {
      const menu = this.#menus[i];
      if (!menu) return;
      group.dataset.key = menu.key;
      const button = this.#buttonOf(group);
      const list = this.#menuOf(group);
      if (button) {
        button.textContent = menu.label;
        button.tabIndex = i === 0 ? 0 : -1;
      }
      if (list) buildMenuList(list, menu.items, (item) => this.#onSelect(menu, item));
    });
  }

  #createGroup(menu: JdMenubarMenu): HTMLElement {
    const group = document.createElement("div");
    group.className = "jd-menubar__group";
    const id = jdUid("jd-menubar-menu");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "jd-menubar__button";
    button.setAttribute("role", "menuitem");
    button.setAttribute("aria-haspopup", "menu");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", id);
    const list = document.createElement("div");
    list.className = "jd-menubar__menu";
    list.id = id;
    list.setAttribute("role", "menu");
    list.setAttribute("aria-label", menu.label);
    list.hidden = true;
    group.append(button, list);
    return group;
  }

  /* ── 상태 ────────────────────────────────────────────────── */

  #applyOpen(): void {
    for (const group of this.#groups()) {
      const open = group.dataset.key === this.#openKey;
      group.toggleAttribute("data-open", open);
      this.#buttonOf(group)?.setAttribute("aria-expanded", String(open));
      const list = this.#menuOf(group);
      if (list) list.hidden = !open;
    }
  }

  /**
   * 열림 상태 변경. update()의 마이크로태스크를 기다리지 않고 즉시 DOM에 반영한다 —
   * 열자마자 첫 항목에 포커스를 줘야 하는데 hidden 요소는 포커스를 받지 못한다.
   */
  #setOpen(key: string | null, focusWhere: "first" | "last" | null = null): void {
    if (this.#openKey === key && !focusWhere) return;
    const prev = this.#openKey;
    this.#openKey = key;
    this.#applyOpen();
    if (prev !== key) {
      if (key) this.emit("jd-open", { menu: key });
      else this.emit("jd-close", { menu: prev });
    }
    if (!key || !focusWhere) return;
    const group = this.#groups().find((g) => g.dataset.key === key);
    const list = group ? this.#menuOf(group) : null;
    if (list) focusMenuItem(list, focusWhere);
  }

  #focusButton(index: number): void {
    const groups = this.#groups();
    const target = groups[index] ?? groups[0];
    if (!target) return;
    for (const group of groups) {
      const button = this.#buttonOf(group);
      if (button) button.tabIndex = group === target ? 0 : -1;
    }
    this.#buttonOf(target)?.focus();
  }

  #onSelect(menu: JdMenubarMenu, item: JdMenuItem): void {
    item.onClick?.();
    this.emit("jd-select", { menu: menu.key, key: item.key, label: item.label });
    const index = this.#menus.indexOf(menu);
    this.#setOpen(null);
    this.#focusButton(index < 0 ? 0 : index);
  }

  /* ── 이벤트 ──────────────────────────────────────────────── */

  #groupOf(target: EventTarget | null): { group: HTMLElement; index: number } | null {
    const el = (target as Element | null)?.closest?.(".jd-menubar__group") ?? null;
    if (!(el instanceof HTMLElement) || el.parentElement !== this) return null;
    return { group: el, index: this.#groups().indexOf(el) };
  }

  #onClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement | null;
    if (!target?.closest(".jd-menubar__button")) return;
    const hit = this.#groupOf(target);
    if (!hit) return;
    const key = hit.group.dataset.key ?? null;
    this.#setOpen(this.#openKey === key ? null : key);
    this.#focusButton(hit.index);
  };

  /** 열려 있을 때만 호버로 메뉴 전환 (v2 handleHover 동형) */
  #onHover = (e: MouseEvent): void => {
    if (this.#openKey === null) return;
    const target = e.target as HTMLElement | null;
    if (!target?.closest(".jd-menubar__button")) return;
    const hit = this.#groupOf(target);
    if (hit) this.#setOpen(hit.group.dataset.key ?? null);
  };

  #onKeydown = (e: KeyboardEvent): void => {
    const hit = this.#groupOf(e.target);
    if (!hit) return;
    const groups = this.#groups();
    const inMenu = Boolean((e.target as HTMLElement).closest(".jd-menubar__menu"));
    const keyAt = (i: number): string | null => this.#menus[i]?.key ?? null;

    switch (e.key) {
      case "Escape":
        if (this.#openKey === null) return;
        e.stopPropagation();
        this.#setOpen(null);
        this.#focusButton(hit.index);
        return;
      case "ArrowRight":
      case "ArrowLeft": {
        e.preventDefault();
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const next = (hit.index + delta + groups.length) % groups.length;
        if (this.#openKey !== null) this.#setOpen(keyAt(next), inMenu ? "first" : null);
        if (!inMenu) this.#focusButton(next);
        return;
      }
      case "ArrowDown":
        if (inMenu) break;
        e.preventDefault();
        this.#setOpen(keyAt(hit.index), "first");
        return;
      case "ArrowUp":
        if (inMenu) break;
        e.preventDefault();
        this.#setOpen(keyAt(hit.index), "last");
        return;
      case "Home":
      case "End":
        if (inMenu) break;
        e.preventDefault();
        this.#focusButton(e.key === "Home" ? 0 : groups.length - 1);
        return;
      case "Tab":
        this.#setOpen(null);
        return;
      default:
        break;
    }
    if (!inMenu) return;
    const list = this.#menuOf(hit.group);
    if (list) handleMenuKeydown(e, list);
  };

  #onOutside = (): void => {
    this.#setOpen(null);
  };
}
