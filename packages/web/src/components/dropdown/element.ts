/**
 * <jd-dropdown> — 트리거로 여는 메뉴 (v2 composites/Dropdown) = Popover 파생.
 *
 * 이 파일은 **메뉴 목록 원형**도 함께 소유한다(buildMenuList/focusMenuItem/
 * handleMenuKeydown). ContextMenu·Menubar가 이 함수와 `.jd-dropdown__*` 클래스를
 * 그대로 재사용한다 — Drawer가 `.jd-modal__panel`을 재사용하는 것과 같은 소유 규칙
 * (§6 R12). v2에서는 Dropdown·ContextMenu·Menubar가 항목 렌더·화살표 내비·구분선을
 * 세 벌로 갖고 있었고 셋 다 조금씩 달랐다(Dropdown만 wrap, ContextMenu만 shortcut,
 * Menubar는 키보드 내비 자체가 없음).
 *
 * 항목 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `items` 프로퍼티 (JdMenuItem[]) — 배열을 **새로 대입**해야 반영된다(제자리 변형 X)
 *  2. 자식 `<script type="application/json">[…]</script>` 슬롯 (DEC-023-3 선례)
 *
 * v2 대비 개선: 트리거 `<div role="button" tabIndex={0}>` 이중 버튼 제거(원형),
 * ArrowUp/Down으로 열면서 첫/마지막 항목 포커스, Home/End, Tab 이탈 시 닫기,
 * 선택·ESC 후 트리거로 포커스 복귀. v2는 focusIndex를 상태로 들고 있었으나
 * 항목 삭제·divider 혼입 시 인덱스가 어긋났다 — 여기서는 실제 DOM 포커스가 유일한 상태다.
 */
import { JdPopover } from "../popover/element.js";
import { adoptStyles } from "../../core/styles.js";
import dropdownStyles from "./dropdown.css.js";

export interface JdMenuItem {
  /** 선택 식별자 — jd-select detail로 전달 */
  key: string;
  label: string;
  /** 아이콘. "<svg…>" 마크업 문자열(신뢰된 값만) 또는 DOM 노드 */
  icon?: string | Node;
  /** 우측 단축키 표기 (v2 ContextMenu·Menubar) */
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  /** true면 구분선 — label/key는 무시된다 */
  divider?: boolean;
  /** v2 ContextMenu/Menubar 호환 콜백. jd-select보다 먼저 호출된다 */
  onClick?: () => void;
}

/** 생성된 메뉴 노드 표식 — 슬롯 children과 섞여도 재구축 대상이 명확하다 */
const MENU_NODE = "data-jd-menu";

/** 활성 항목(비활성 제외) — 화살표 내비 대상 */
export function menuItemsOf(host: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    host.querySelectorAll<HTMLButtonElement>(":scope > .jd-dropdown__item:not([disabled])"),
  );
}

/** 메뉴 항목 포커스 이동. "first"|"last" 또는 상대 이동(+1/-1, 순환) */
export function focusMenuItem(host: HTMLElement, target: "first" | "last" | 1 | -1): void {
  const items = menuItemsOf(host);
  if (items.length === 0) return;
  let index = 0;
  if (target === "last") index = items.length - 1;
  else if (target === 1 || target === -1) {
    const current = items.indexOf(host.ownerDocument.activeElement as HTMLButtonElement);
    index =
      current < 0
        ? target === 1
          ? 0
          : items.length - 1
        : (current + target + items.length) % items.length;
  }
  items[index]?.focus();
}

/** 메뉴 공통 키 내비. 처리했으면 true */
export function handleMenuKeydown(e: KeyboardEvent, host: HTMLElement): boolean {
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      focusMenuItem(host, 1);
      return true;
    case "ArrowUp":
      e.preventDefault();
      focusMenuItem(host, -1);
      return true;
    case "Home":
      e.preventDefault();
      focusMenuItem(host, "first");
      return true;
    case "End":
      e.preventDefault();
      focusMenuItem(host, "last");
      return true;
    default:
      return false;
  }
}

/**
 * 항목 목록을 host의 직계 자식으로 (재)구축한다.
 * host는 role="menu"를 가진 요소여야 한다 — menuitem은 menu의 직계 소유여야 하므로
 * 중간 래퍼를 두지 않는다(v2는 패널 안에 버튼을 직접 넣어 이 점은 동일했다).
 */
export function buildMenuList(
  host: HTMLElement,
  items: readonly JdMenuItem[],
  onSelect: (item: JdMenuItem) => void,
): void {
  for (const node of Array.from(host.querySelectorAll(`:scope > [${MENU_NODE}]`))) node.remove();
  const doc = host.ownerDocument;
  const frag = doc.createDocumentFragment();
  for (const item of items) {
    if (item.divider) {
      const sep = doc.createElement("div");
      sep.className = "jd-dropdown__divider";
      sep.setAttribute("role", "separator");
      sep.setAttribute(MENU_NODE, "");
      frag.append(sep);
      continue;
    }
    const btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "jd-dropdown__item";
    btn.setAttribute("role", "menuitem");
    btn.setAttribute(MENU_NODE, "");
    // 메뉴는 단일 tabstop이 아니라 "Tab이면 이탈" 패턴 — 포커스는 코드가 옮긴다
    btn.tabIndex = -1;
    btn.disabled = Boolean(item.disabled);
    if (item.danger) btn.setAttribute("data-danger", "");
    if (item.icon !== undefined) {
      const icon = doc.createElement("span");
      icon.className = "jd-dropdown__icon";
      icon.setAttribute("aria-hidden", "true");
      if (typeof item.icon === "string") {
        // 마크업으로 보이면 그대로, 아니면 텍스트 — 임의 문자열이 HTML로 새지 않는다
        if (item.icon.trimStart().startsWith("<")) icon.innerHTML = item.icon;
        else icon.textContent = item.icon;
      } else {
        icon.append(item.icon);
      }
      btn.append(icon);
    }
    const label = doc.createElement("span");
    label.className = "jd-dropdown__label";
    label.textContent = item.label;
    btn.append(label);
    if (item.shortcut) {
      const shortcut = doc.createElement("span");
      shortcut.className = "jd-dropdown__shortcut";
      shortcut.textContent = item.shortcut;
      btn.append(shortcut);
    }
    btn.addEventListener("click", () => onSelect(item));
    frag.append(btn);
  }
  host.append(frag);
}

/** `<script type="application/json">` 슬롯 1회 소비 (radio-group·action-sheet 선례) */
export function readJsonSlot<T>(host: HTMLElement): T[] | null {
  const script = host.querySelector<HTMLScriptElement>(
    ':scope > script[type="application/json"]',
  );
  if (!script) return null;
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(script.textContent || "[]");
  } catch {
    console.warn(`[junds] <${host.localName}> JSON 슬롯 파싱 실패 — 무시합니다.`);
  }
  script.remove();
  return Array.isArray(parsed) ? (parsed as T[]) : null;
}

export class JdDropdown extends JdPopover {
  static override tag = "jd-dropdown";
  static override props = {
    ...JdPopover.props,
    /** v2 Dropdown 기본 정렬은 right */
    align: { type: String, default: "right", reflect: true },
  };

  #items: JdMenuItem[] = [];
  #built: readonly JdMenuItem[] | null = null;
  #pendingFocus: "first" | "last" | null = null;

  get items(): JdMenuItem[] {
    return this.#items;
  }
  set items(v: JdMenuItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  /** v2: children이 트리거, 항목은 items 프롭 */
  protected override get defaultSlot(): "trigger" | "content" {
    return "trigger";
  }
  protected override get panelRole(): string {
    return "menu";
  }
  protected override get ariaPopupType(): string | null {
    return "menu";
  }

  protected override render(): void {
    // JSON 슬롯은 children 분류(트리거 귀속) 전에 걷어낸다
    const parsed = readJsonSlot<JdMenuItem>(this);
    if (parsed) this.#items = parsed;
    super.render();
    adoptStyles(dropdownStyles);
    this.update();
  }

  protected override update(): void {
    this.#syncItems(); // 항목 구축이 먼저 — 열림 전이(opened)가 포커스를 잡을 수 있어야 한다
    super.update();
  }

  #syncItems(): void {
    const panel = this.panelEl;
    if (!panel || this.#built === this.#items) return;
    this.#built = this.#items;
    buildMenuList(panel, this.#items, this.#onSelect);
  }

  #onSelect = (item: JdMenuItem): void => {
    item.onClick?.();
    this.emit("jd-select", { key: item.key, label: item.label });
    this.requestClose("select");
    this.focusControl();
  };

  /** 열릴 때 포커스를 옮길 위치 예약 — ContextMenu가 재사용한다 */
  protected requestItemFocus(where: "first" | "last" | null): void {
    this.#pendingFocus = where;
  }

  protected override opened(): void {
    const panel = this.panelEl;
    if (panel && this.#pendingFocus) focusMenuItem(panel, this.#pendingFocus);
    this.#pendingFocus = null;
  }

  protected override closed(): void {
    this.#pendingFocus = null;
  }

  protected override triggerKeydown(e: KeyboardEvent): void {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const where = e.key === "ArrowDown" ? "first" : "last";
      if (this.open) {
        const panel = this.panelEl;
        if (panel) focusMenuItem(panel, where);
      } else {
        this.requestItemFocus(where);
        this.show();
      }
      return;
    }
    // 네이티브 버튼은 Enter/Space를 스스로 click으로 바꾼다 — 여기서 토글하면 이중 전환
    if (e.key === "Enter" || e.key === " ") this.requestItemFocus("first");
    super.triggerKeydown(e);
  }

  protected override panelKeydown(e: KeyboardEvent): void {
    const panel = this.panelEl;
    if (!panel) return;
    if (e.key === "Tab") {
      // 메뉴 밖으로 나가는 조작 — APG 메뉴 패턴대로 닫는다(포커스는 브라우저가 옮긴다)
      this.requestClose("api");
      return;
    }
    handleMenuKeydown(e, panel);
  }
}
