/**
 * <jd-settings-layout> — 설정 페이지 표준 레이아웃 (v2 patterns/SettingsLayout).
 *
 * 좌측 사이드바(그룹 구분 내비) + 우측 탭형 컨텐츠. v2는 `sections[].content`에
 * ReactNode를 담았지만, 바닐라에서는 복합 데이터를 attribute로 못 싣는다(§1.3/WEB-03).
 * 그래서 입력을 둘로 나눈다:
 *
 *  1. **내비 메타** — `sections` 프로퍼티(Array<{id,label,icon?,group?,content?}>) 또는
 *     선언적 자식 `<script type="application/json">` 슬롯(radio-group·tabs 선례).
 *  2. **패널 컨텐츠** — light-DOM 자식을 `data-section="<id>"`로 키잉해 슬롯팅(app-shell
 *     선례). 활성 섹션만 보이고 나머지는 hidden. 편의상 `sections[].content`(string|Node)로도
 *     패널을 만들 수 있다(tabs.icon과 같은 문자열/노드 2경로).
 *
 * v2 대비 개선(구조·접근성):
 *  - **WAI-ARIA APG "Tabs"(세로) 패턴**: 내비 role=tablist·aria-orientation=vertical,
 *    각 항목 role=tab, 패널 role=tabpanel + aria-labelledby로 탭↔패널 결선. v2는 이 결선이
 *    전혀 없었다(그냥 button + div).
 *  - **키보드**: ↑/↓ 로빙 tabindex(활성 탭만 탭 순서에 남는다) + Home/End + 순환.
 *    자동 활성화(포커스 이동이 곧 선택). v2엔 키보드 내비가 없었다.
 *  - **프롭 rename**: v2 `title`은 `HTMLElement.title`(툴팁)과 충돌하므로 `heading`으로
 *    옮겼다. 컨트롤드/언컨트롤드(activeId/defaultActiveId)는 CE 관용대로 단일 `active` +
 *    `jd-change`로 접었다(tabs.value 선례).
 *
 * sidebarWidth·색/치수는 v2 Tailwind의 토큰 번역(§4.3): `bg-surface`→card,
 * `bg-surface-soft`→card-hover, `bg-primary-soft`→primary-light(DEC-025-4/blockquote 선례).
 */
import { JdElement } from "../../core/element.js";
import { setContent, type JdContent } from "../../core/content.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createKeyHandler } from "../../behaviors/input.js";
import settingsLayoutStyles from "./settings-layout.css.js";

export interface JdSettingsSection {
  /** 섹션 식별자 — active 프로퍼티·jd-change detail·패널 data-section과 대응 */
  id: string;
  /** 사이드바 라벨 */
  label: string;
  /** 좌측 아이콘. 문자열(평문), DOM 노드 또는 `unsafeHtml()`로 표시한 값 */
  icon?: JdContent;
  /** 그룹명 — 있으면 카테고리 라벨로 묶인다 */
  group?: string;
  /** 편의 컨텐츠 — 대응 data-section 슬롯 패널이 없을 때만 이 값으로 패널을 만든다 */
  content?: JdContent;
}

function fill(slot: HTMLElement, value: JdContent | undefined | null): void {
  setContent(slot, value);
}

export class JdSettingsLayout extends JdElement {
  static override tag = "jd-settings-layout";
  static override props = {
    /** 활성 섹션 id (단일 소스 — tabs.value 관용) */
    active: { type: String, reflect: true },
    /** 사이드바 상단 제목(v2 title) — 내비 접근 이름으로도 쓰인다 */
    heading: { type: String },
    /** 사이드바 폭(px). 데스크톱(≥1024px)에서만 적용, 모바일은 전폭 */
    sidebarWidth: { type: Number, default: 220 },
    // sections(Array)는 property 전용(§1.3) — 아래 접근자로 선언
  };

  declare active: string;
  declare heading: string;
  declare sidebarWidth: number;

  #sections: JdSettingsSection[] = [];
  /** 마지막으로 내비 골격에 반영한 배열 — 재구축 1회 판정(tabs.#built 선례) */
  #built: readonly JdSettingsSection[] | null = null;

  #sidebar!: HTMLElement;
  #titleEl!: HTMLElement;
  #nav!: HTMLElement;
  #content!: HTMLElement;
  /** section.id → 탭 버튼 (패널 aria-labelledby 결선용) */
  #items = new Map<string, HTMLButtonElement>();
  /** section.id → 패널 요소 */
  #panels = new Map<string, HTMLElement>();

  get sections(): JdSettingsSection[] {
    return this.#sections;
  }
  set sections(v: JdSettingsSection[]) {
    this.#sections = Array.isArray(v) ? v : [];
    this.#built = null; // 같은 배열을 다시 대입해도 재동기화
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(settingsLayoutStyles);
    this.#readJson();

    const existing = this.querySelector<HTMLElement>(":scope > .jd-settings-layout__content");
    if (existing) {
      // 입양(§3.3): SSR/프리렌더가 그린 골격 재사용 — 사용자 패널·포커스 보존
      this.#sidebar = this.querySelector(":scope > .jd-settings-layout__sidebar")!;
      this.#titleEl = this.#sidebar.querySelector(".jd-settings-layout__title")!;
      this.#nav = this.#sidebar.querySelector(".jd-settings-layout__nav")!;
      this.#content = existing;
      this.#built = null; // 내비는 #sections 기준으로 1회 재구축(결정적)
    } else {
      this.#build();
    }
    this.#collectPanels();

    // 내비 tablist 의미론(APG Tabs, 세로)
    this.#nav.setAttribute("role", "tablist");
    this.#nav.setAttribute("aria-orientation", "vertical");
    this.update();
  }

  #build(): void {
    // json 스크립트는 #readJson에서 이미 제거됨 — 남은 자식이 패널 후보
    const kids = [...this.childNodes];

    this.#sidebar = document.createElement("aside");
    this.#sidebar.className = "jd-settings-layout__sidebar";

    this.#titleEl = document.createElement("div");
    this.#titleEl.className = "jd-settings-layout__title";
    this.#titleEl.hidden = true;

    this.#nav = document.createElement("nav");
    this.#nav.className = "jd-settings-layout__nav";
    this.#sidebar.append(this.#titleEl, this.#nav);

    this.#content = document.createElement("main");
    this.#content.className = "jd-settings-layout__content";
    // 본문이 유일한 스크롤러 — 포커서블 자손이 없어도 키보드 스크롤 보장(app-shell 선례)
    this.#content.tabIndex = 0;
    this.#content.append(...kids); // 사용자 패널을 본문으로 이동

    this.append(this.#sidebar, this.#content);
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (radio-group·tabs 선례) */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdSettingsSection[];
      if (Array.isArray(parsed)) this.#sections = parsed;
    } catch {
      console.warn("[junds] <jd-settings-layout> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 본문 안의 data-section 슬롯 패널을 수집 */
  #collectPanels(): void {
    this.#panels.clear();
    const provided = this.#content.querySelectorAll<HTMLElement>(":scope > [data-section]");
    for (const el of provided) {
      const id = el.getAttribute("data-section");
      if (id && !this.#panels.has(id)) {
        el.classList.add("jd-settings-layout__panel");
        this.#panels.set(id, el);
      }
    }
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
    this.own(
      createKeyHandler(
        this,
        {
          arrowdown: (e) => this.#navMove(e, 1),
          arrowup: (e) => this.#navMove(e, -1),
          home: (e) => this.#navMove(e, "home"),
          end: (e) => this.#navMove(e, "end"),
        },
        { preventDefault: false }, // 탭에 포커스가 있을 때만 직접 취소(본문 스크롤 보존)
      ),
    );
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  /** 내비의 탭 버튼들 — DOM 순서(그룹 순서 반영) */
  #buttons(): HTMLButtonElement[] {
    return Array.from(this.#nav.querySelectorAll<HTMLButtonElement>("button.jd-settings-layout__item"));
  }

  /** 유효한 활성 id — active가 섹션에 없으면 첫 섹션으로 폴백 */
  #activeId(): string {
    const ids = this.#sections.map((s) => s.id);
    return this.active && ids.includes(this.active) ? this.active : ids[0] ?? "";
  }

  #onClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest("button.jd-settings-layout__item");
    if (!btn || !this.#nav.contains(btn)) return;
    const id = (btn as HTMLElement).dataset.id;
    if (id) this.#commit(id);
  };

  #navMove(e: KeyboardEvent, to: 1 | -1 | "home" | "end"): void {
    const current = (e.target as Element | null)?.closest(
      "button.jd-settings-layout__item",
    ) as HTMLButtonElement | null;
    if (!current || !this.#nav.contains(current)) return; // 본문 포커스면 무시
    const buttons = this.#buttons();
    const n = buttons.length;
    if (n === 0) return;
    e.preventDefault();
    const from = buttons.indexOf(current);
    let index: number;
    if (to === "home") index = 0;
    else if (to === "end") index = n - 1;
    else index = (((from + to) % n) + n) % n; // 순환
    this.#activateAt(buttons, index);
  }

  /** 자동 활성화(APG 기본): 포커스 이동이 곧 선택 */
  #activateAt(buttons: HTMLButtonElement[], index: number): void {
    const btn = buttons[index];
    if (!btn) return;
    const id = btn.dataset.id;
    if (id) this.#commit(id);
    // update()의 마이크로태스크를 기다리지 않는다 — tabindex -1인 채로 포커스를 주면 탭 순서가 어긋난다
    buttons.forEach((b, i) => {
      b.tabIndex = i === index ? 0 : -1;
    });
    btn.focus();
  }

  #commit(id: string): void {
    if (this.#activeId() === id) return;
    this.active = id;
    this.emit("jd-change", { value: id });
  }

  protected override update(): void {
    if (this.#built !== this.#sections) this.#syncNav();

    const activeId = this.#activeId();
    const buttons = this.#buttons();
    // 그룹핑으로 버튼 DOM 순서가 #sections 순서와 어긋날 수 있어 id로 대조한다(인덱스 금지)
    let rovingIndex = buttons.findIndex((b) => b.dataset.id === activeId);
    if (rovingIndex < 0) rovingIndex = 0; // 선택 없으면 첫 탭이 탭 순서를 대표(탭스톱 1개)
    buttons.forEach((btn, i) => {
      btn.setAttribute("aria-selected", String(btn.dataset.id === activeId));
      btn.tabIndex = i === rovingIndex ? 0 : -1;
    });

    this.#syncPanels(activeId);

    // 제목 — 없으면 감춘다. 내비 접근 이름은 제목(있으면) 아니면 기본값
    const hasHeading = Boolean(this.heading);
    this.#titleEl.hidden = !hasHeading;
    if (hasHeading) this.#titleEl.textContent = this.heading;
    this.#nav.setAttribute("aria-label", this.heading || "설정");

    this.style.setProperty("--_jd-settings-sidebar-w", `${this.sidebarWidth}px`);
  }

  /** 내비 골격 재구축 — 그룹별 래퍼 + 탭 버튼. 입양보다 재구축이 단순·결정적 */
  #syncNav(): void {
    this.#built = this.#sections;
    this.#nav.textContent = "";
    this.#items.clear();

    // 그룹 순서 보존(v2 reduce 동형)
    const groups = new Map<string | undefined, JdSettingsSection[]>();
    for (const s of this.#sections) {
      const list = groups.get(s.group) ?? [];
      list.push(s);
      groups.set(s.group, list);
    }

    for (const [group, items] of groups) {
      const wrap = document.createElement("div");
      wrap.className = "jd-settings-layout__group";
      wrap.setAttribute("role", "presentation"); // tablist가 탭을 직접 소유하도록 그룹은 표현용
      if (group) {
        const label = document.createElement("div");
        label.className = "jd-settings-layout__group-label";
        // 그룹 라벨은 시각적 군집 표지 — tablist에 잡음 텍스트를 넣지 않도록 AT에서 숨긴다
        label.setAttribute("aria-hidden", "true");
        label.textContent = group;
        wrap.append(label);
      }
      for (const section of items) {
        const btn = this.#createItem(section);
        this.#items.set(section.id, btn);
        wrap.append(btn);
      }
      this.#nav.append(wrap);
    }
  }

  #createItem(section: JdSettingsSection): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jd-settings-layout__item";
    btn.setAttribute("role", "tab");
    btn.id = jdUid("jd-settings-tab");
    btn.dataset.id = section.id;

    const icon = document.createElement("span");
    icon.className = "jd-settings-layout__icon";
    icon.setAttribute("aria-hidden", "true");
    fill(icon, section.icon);
    icon.hidden = !section.icon;

    const label = document.createElement("span");
    label.className = "jd-settings-layout__label";
    label.textContent = section.label;

    btn.append(icon, label);
    return btn;
  }

  /** 패널 role/결선/표시 — 슬롯 패널 없으면 content로 생성 */
  #syncPanels(activeId: string): void {
    for (const section of this.#sections) {
      let panel = this.#panels.get(section.id);
      if (!panel && section.content !== undefined && section.content !== null && section.content !== "") {
        panel = document.createElement("div");
        panel.className = "jd-settings-layout__panel";
        panel.dataset.section = section.id;
        fill(panel, section.content);
        this.#panels.set(section.id, panel);
        this.#content.append(panel);
      }
      if (!panel) continue;
      panel.setAttribute("role", "tabpanel");
      const btn = this.#items.get(section.id);
      if (btn) panel.setAttribute("aria-labelledby", btn.id);
      if (!panel.hasAttribute("tabindex")) panel.tabIndex = 0;
      panel.hidden = section.id !== activeId;
    }
  }
}
