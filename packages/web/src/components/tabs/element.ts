/**
 * <jd-tabs> — 탭 내비게이션 (v2 composites/Tabs).
 *
 * 탭 목록은 property(Array) 또는 자식 `<script type="application/json">` 슬롯
 * (§1.3 복합 데이터 attribute 금지 · DEC-023-3 선례).
 *
 * v2 결함 3건 교정:
 *  1. **화살표 키가 없었다.** v2 JSDoc은 "키보드 화살표 키로 탭 전환이 가능합니다"라고
 *     적어 두고 핸들러를 하나도 달지 않았다 — 지키지 않는 약속이었다. v3는 APG Tabs
 *     패턴대로 ←/→ 로빙 tabindex(선택 탭만 탭 순서에 남는다) + Home/End + 비활성 탭
 *     건너뛰기 + 순환을 구현한다(자동 활성화 — 포커스 이동이 곧 선택).
 *  2. **role=tab이 tabpanel과 연결되지 않았다.** v2는 role만 있고 id·aria-controls가
 *     없어 AT가 "탭 3개 중 2번째"까지만 알고 무엇을 제어하는지는 몰랐다. v3는 탭에
 *     id를 발급하고, `panel`(패널 요소 id)이 주어지면 aria-controls로 결선하며 패널
 *     쪽의 role=tabpanel·aria-labelledby·hidden까지 관리한다.
 *  3. **tablist에 접근 이름이 없었다.** `label` 프로퍼티 → aria-label.
 *
 * variant(underline/pills/segment)·size 분기는 호스트 속성 셀렉터가 담당한다(§4.3) —
 * v2가 variant마다 통째로 복제했던 3벌 JSX는 골격 1벌 + CSS로 접힌다.
 */
import { JdElement } from "../../core/element.js";
import {
  isContentEmpty,
  setContent,
  type JdContent,
} from "../../core/content.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createKeyHandler } from "../../behaviors/input.js";
import tabsStyles from "./tabs.css.js";

export interface JdTab {
  /** 선택 식별자 — value 프로퍼티·jd-change detail과 대응 */
  value: string;
  label: string;
  /** 아이콘. 문자열(평문), DOM 노드 또는 `unsafeHtml()`로 표시한 값 */
  icon?: JdContent;
  /** 라벨 오른쪽 카운트 배지 */
  badge?: number | string;
  disabled?: boolean;
  /** 이 탭이 제어하는 패널 요소의 id — 주면 aria-controls·패널 상태까지 관리한다 */
  panel?: string;
}

/** 아이콘 슬롯 채우기 — 문자열은 마크업이면 innerHTML, 아니면 텍스트 (jd-dropdown 선례) */
function fillIcon(slot: HTMLElement, icon: JdContent | undefined): void {
  if (isContentEmpty(icon)) {
    slot.hidden = true;
    setContent(slot, icon);
    return;
  }
  slot.hidden = false;
  setContent(slot, icon);
}

export class JdTabs extends JdElement {
  static override tag = "jd-tabs";
  static override props = {
    /** 선택된 탭의 value */
    value: { type: String, reflect: true },
    /** underline | pills | segment */
    variant: { type: String, default: "underline", reflect: true },
    /** sm | md */
    size: { type: String, default: "md", reflect: true },
    /** tablist 접근 이름 */
    label: { type: String },
  };

  declare value: string;
  declare variant: string;
  declare size: string;
  declare label: string;

  #tabs: JdTab[] = [];
  /** 마지막으로 골격에 반영한 배열 — 데이터 동기화 1회 판정 */
  #built: readonly JdTab[] | null = null;

  get tabs(): JdTab[] {
    return this.#tabs;
  }
  set tabs(v: JdTab[]) {
    this.#tabs = Array.isArray(v) ? v : [];
    this.#built = null; // 같은 배열을 다시 대입해도 재동기화한다
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(tabsStyles);
    this.#readJson();
    this.setAttribute("role", "tablist");
    this.setAttribute("aria-orientation", "horizontal");
    this.#sync();
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
    this.own(
      createKeyHandler(this, {
        arrowright: () => this.#step(1),
        arrowleft: () => this.#step(-1),
        home: () => this.#selectAt(this.#edge(1)),
        end: () => this.#selectAt(this.#edge(-1)),
      }),
    );
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (radio-group·action-sheet 선례) */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdTab[];
      if (Array.isArray(parsed)) this.#tabs = parsed;
    } catch {
      console.warn("[junds] <jd-tabs> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #buttons(): HTMLButtonElement[] {
    return Array.from(this.querySelectorAll<HTMLButtonElement>(":scope > button.jd-tabs__tab"));
  }

  /** 골격 구축·데이터 반영. 입양(§3.3): 개수가 같으면 만들지 않고 내용만 맞춘다 */
  #sync(): void {
    this.#built = this.#tabs;
    let buttons = this.#buttons();
    if (buttons.length !== this.#tabs.length) {
      for (const b of buttons) b.remove();
      for (let i = 0; i < this.#tabs.length; i++) this.append(this.#createTab());
      buttons = this.#buttons();
    }
    buttons.forEach((btn, i) => {
      const tab = this.#tabs[i];
      if (!tab) return;
      if (!btn.id) btn.id = jdUid("jd-tab");
      btn.dataset.value = tab.value;
      btn.disabled = Boolean(tab.disabled);
      fillIcon(btn.querySelector<HTMLElement>(".jd-tabs__icon")!, tab.icon);
      btn.querySelector<HTMLElement>(".jd-tabs__label")!.textContent = tab.label;
      const badge = btn.querySelector<HTMLElement>(".jd-tabs__badge")!;
      const hasBadge = tab.badge !== undefined && tab.badge !== null;
      badge.textContent = hasBadge ? String(tab.badge) : "";
      badge.hidden = !hasBadge;
      if (tab.panel) btn.setAttribute("aria-controls", tab.panel);
      else btn.removeAttribute("aria-controls");
    });
  }

  #createTab(): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jd-tabs__tab";
    btn.setAttribute("role", "tab");
    const icon = document.createElement("span");
    icon.className = "jd-tabs__icon";
    icon.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "jd-tabs__label";
    const badge = document.createElement("span");
    badge.className = "jd-tabs__badge";
    btn.append(icon, label, badge);
    return btn;
  }

  protected override update(): void {
    if (this.#built !== this.#tabs) this.#sync();
    const buttons = this.#buttons();
    const selectedIndex = this.#tabs.findIndex((t) => t.value === this.value);
    // 선택이 없으면 첫 활성 탭이 탭 순서를 대표한다 — 탭 묶음의 탭스톱은 항상 1개
    const rovingIndex = selectedIndex >= 0 ? selectedIndex : this.#edge(1);
    buttons.forEach((btn, i) => {
      const selected = i === selectedIndex;
      btn.setAttribute("aria-selected", String(selected));
      btn.tabIndex = i === rovingIndex ? 0 : -1;
    });
    if (this.label) this.setAttribute("aria-label", this.label);
    else this.removeAttribute("aria-label");
    this.#syncPanels(buttons, selectedIndex);
  }

  /** `panel` id가 가리키는 외부 요소의 tabpanel 의미론을 관리한다 (v2에는 없던 결선) */
  #syncPanels(buttons: HTMLButtonElement[], selectedIndex: number): void {
    for (let i = 0; i < this.#tabs.length; i++) {
      const tab = this.#tabs[i];
      if (!tab?.panel) continue;
      const panel = this.ownerDocument.getElementById(tab.panel);
      if (!panel) continue;
      panel.setAttribute("role", "tabpanel");
      const btn = buttons[i];
      if (btn?.id) panel.setAttribute("aria-labelledby", btn.id);
      if (!panel.hasAttribute("tabindex")) panel.tabIndex = 0;
      panel.hidden = i !== selectedIndex;
    }
  }

  /** dir 1이면 첫 활성 탭, -1이면 마지막 활성 탭 */
  #edge(dir: 1 | -1): number {
    const n = this.#tabs.length;
    for (let k = 0; k < n; k++) {
      const i = dir === 1 ? k : n - 1 - k;
      if (!this.#tabs[i]?.disabled) return i;
    }
    return -1;
  }

  /** 현재 포커스(없으면 선택) 위치에서 delta칸 — 비활성은 건너뛰고 순환한다 */
  #step(delta: 1 | -1): void {
    const n = this.#tabs.length;
    if (n === 0) return;
    const buttons = this.#buttons();
    const active = (this.ownerDocument.activeElement as Element | null)?.closest(
      "button.jd-tabs__tab",
    );
    let from = active ? buttons.indexOf(active as HTMLButtonElement) : -1;
    if (from < 0) from = this.#tabs.findIndex((t) => t.value === this.value);
    if (from < 0) from = delta === 1 ? -1 : 0;
    for (let k = 1; k <= n; k++) {
      const i = (((from + delta * k) % n) + n) % n;
      if (!this.#tabs[i]?.disabled) {
        this.#selectAt(i);
        return;
      }
    }
  }

  /** 자동 활성화(APG 기본): 포커스 이동이 곧 선택 */
  #selectAt(index: number): void {
    const tab = index >= 0 ? this.#tabs[index] : undefined;
    if (!tab || tab.disabled) return;
    this.#commit(tab);
    // update()의 마이크로태스크를 기다리지 않는다 — tabindex -1인 채로 포커스를 주면
    // 이후 Tab 키 순서가 어긋난다
    const buttons = this.#buttons();
    buttons.forEach((btn, i) => {
      btn.tabIndex = i === index ? 0 : -1;
    });
    buttons[index]?.focus();
  }

  #commit(tab: JdTab): void {
    if (this.value === tab.value) return;
    this.value = tab.value;
    this.emit("jd-change", { value: tab.value });
  }

  #onClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest("button.jd-tabs__tab");
    if (!btn || btn.parentElement !== this) return;
    const index = this.#buttons().indexOf(btn as HTMLButtonElement);
    const tab = index >= 0 ? this.#tabs[index] : undefined;
    if (!tab || tab.disabled) return;
    this.#commit(tab);
  };
}
