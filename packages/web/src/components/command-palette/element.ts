/**
 * <jd-command-palette> — 커맨드 팔레트 (⌘K). v2 ds/patterns/CommandPalette 이식 = Modal 파생.
 *
 * v2는 오버레이·백드롭·ESC·스크롤 락을 직접 구현했고 접근성 트리가 전혀 없었다(그냥
 * <button> 목록). v3는 그 오버레이 골격을 전부 jd-modal에서 상속받고(포커스 감금·요청형
 * 닫기 jd-request-close·재연결 복원·body 스크롤 락은 공짜), 위에 **combobox+listbox
 * 접근성 패턴**을 얹는다(§6 R12 파생 규칙).
 *
 * 항목 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `items` 프로퍼티: Array<{ id, label, description?, icon?, group?, keywords?, action? }>
 *  2. 선언적 초기화: 자식 `<script type="application/json">[…]</script>` 슬롯(DEC-023-3 선례).
 *     JSON에는 함수를 담을 수 없으므로 이 경로의 항목은 `action`이 없다 — 실행 시
 *     jd-select { id } 이벤트만 발행하고 소비자가 라우팅한다.
 *
 * a11y(v2 대비 순증):
 *  - 입력=role="combobox"(aria-autocomplete=list, aria-controls, aria-activedescendant)
 *  - 목록=role="listbox", 그룹=role="group"[aria-label], 항목=role="option"[aria-selected]
 *  - 활성 항목은 키보드/포인터 공통 하이라이트 하나로 통합(v2는 hover/active 이중 하이라이트)
 *  - 화살표는 scrollIntoView(block:nearest)로 활성 항목을 뷰로 끌어온다(v2엔 없었다).
 *
 * icon 문자열도 기본적으로 평문이다. 검증된 SVG/HTML만 `unsafeHtml()`로 표시한다.
 * ⌘K 전역 단축키는 `hotkey` 프로퍼티(기본 "mod+k", 빈 문자열이면 비활성).
 */
import { JdModal } from "../modal/element.js";
import { setContent, type JdContent } from "../../core/content.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createHotkeys, type HotkeyMap } from "../../behaviors/input.js";
import type { Behavior } from "../../behaviors/types.js";
import commandPaletteStyles from "./command-palette.css.js";

export interface JdCommandItem {
  id: string;
  label: string;
  description?: string;
  /** 아이콘. 문자열(평문), DOM 노드 또는 `unsafeHtml()`로 표시한 값 */
  icon?: JdContent;
  group?: string;
  keywords?: string[];
  /** items 프로퍼티 경로에서만. 실행 시 호출 + jd-select 발행 */
  action?: () => void;
}

const SEARCH_SVG =
  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">` +
  `<circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdCommandPalette extends JdModal {
  static override tag = "jd-command-palette";
  static override props = {
    ...JdModal.props,
    placeholder: { type: String, default: "검색 또는 명령어 입력..." },
    emptyText: { type: String, default: "결과 없음", attribute: "empty-text" },
    /** 전역 토글 단축키. 빈 문자열이면 비활성 */
    hotkey: { type: String, default: "mod+k" },
  };

  declare placeholder: string;
  declare emptyText: string;
  declare hotkey: string;

  #items: JdCommandItem[] = [];
  #filtered: JdCommandItem[] = [];
  #search = "";
  #activeIdx = 0;
  #lastOpen = false;

  #searchRow: HTMLElement | null = null;
  #input: HTMLInputElement | null = null;
  #results: HTMLElement | null = null;
  #footer: HTMLElement | null = null;
  #listId = "";
  #optionEls: HTMLElement[] = [];
  #lastPx = NaN;
  #lastPy = NaN;

  #hotkeys?: Behavior<HotkeyMap>;
  #boundHotkey = "";

  get items(): JdCommandItem[] {
    return this.#items;
  }
  set items(v: JdCommandItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    if (this.#results) this.#renderResults();
  }

  protected override render(): void {
    this.#readJson(); // super.render()가 패널로 옮기기 전에 슬롯 소비
    super.render(); // 백드롭·패널 구축(children 이동 — 보통 비어 있음)
    adoptStyles(commandPaletteStyles);
    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (!panel) return;
    // 입양 규칙(§3.3): SSR 프리렌더 골격이 있으면 재사용
    const search = panel.querySelector<HTMLElement>(":scope > .jd-command-palette__search");
    if (search) {
      this.#searchRow = search;
      this.#input = panel.querySelector(
        ":scope > .jd-command-palette__search .jd-command-palette__input",
      );
      this.#results = panel.querySelector(":scope > .jd-command-palette__results");
      this.#footer = panel.querySelector(":scope > .jd-command-palette__footer");
      this.#listId = this.#results?.id || jdUid("jd-cmdk-list");
    } else {
      this.#build(panel);
    }
    this.#renderResults();
    this.update();
  }

  #build(panel: HTMLElement): void {
    this.#listId = jdUid("jd-cmdk-list");

    const row = document.createElement("div");
    row.className = "jd-command-palette__search";
    const icon = document.createElement("span");
    icon.className = "jd-command-palette__search-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = SEARCH_SVG;
    const input = document.createElement("input");
    input.className = "jd-command-palette__input";
    input.type = "text";
    input.id = jdUid("jd-cmdk-input");
    input.setAttribute("data-autofocus", ""); // Modal 포커스트랩 initialFocus 대상
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-controls", this.#listId);
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("spellcheck", "false");
    const esc = document.createElement("jd-kbd");
    esc.setAttribute("keys", "ESC");
    row.append(icon, input, esc);

    const results = document.createElement("div");
    results.className = "jd-command-palette__results";
    results.id = this.#listId;
    results.setAttribute("role", "listbox");
    results.setAttribute("aria-label", "명령어 결과");

    const footer = document.createElement("div");
    footer.className = "jd-command-palette__footer";
    footer.innerHTML =
      `<span class="jd-command-palette__hint"><jd-kbd keys="↑"></jd-kbd><jd-kbd keys="↓"></jd-kbd>이동</span>` +
      `<span class="jd-command-palette__hint"><jd-kbd keys="↵"></jd-kbd>실행</span>`;

    panel.append(row, results, footer);
    this.#searchRow = row;
    this.#input = input;
    this.#results = results;
    this.#footer = footer;
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdCommandItem[];
      if (Array.isArray(parsed)) this.#items = parsed;
    } catch {
      /* 잘못된 JSON은 무시 — 렌더를 깨뜨리지 않는다 */
    }
    script.remove();
  }

  protected override connected(): void {
    super.connected(); // Modal: 포커스트랩 생성 + 열림 복원
    this.#input?.addEventListener("input", this.#onInput);
    this.#input?.addEventListener("keydown", this.#onInputKeydown);
    this.#results?.addEventListener("click", this.#onResultsClick);
    this.#results?.addEventListener("pointermove", this.#onResultsPointerMove);
    // 전역 단축키 — own()이 disconnected 시 destroy. 빈 map으로도 만들어 두면 런타임 활성화도 반영됨
    this.#hotkeys = this.own(createHotkeys(this.#hotkeyMap(), { enableOnFormTags: true }));
    this.#boundHotkey = this.hotkey;
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("input", this.#onInput);
    this.#input?.removeEventListener("keydown", this.#onInputKeydown);
    this.#results?.removeEventListener("click", this.#onResultsClick);
    this.#results?.removeEventListener("pointermove", this.#onResultsPointerMove);
    super.disconnected(); // Modal: 연결 해제 시 열림이면 정리
  }

  protected override update(): void {
    super.update(); // Modal 열림/닫힘 전이(포커스트랩·스크롤 락·jd-open/close)
    // 단축키 런타임 변경 반영(재생성 없이 map 교체)
    if (this.#hotkeys && this.hotkey !== this.#boundHotkey) {
      this.#hotkeys.update?.(this.#hotkeyMap());
      this.#boundHotkey = this.hotkey;
    }
    if (!this.#input) return; // super.render() 중 이른 update — 아직 골격 없음
    this.#input.placeholder = this.placeholder;
    // 열림 전이(false→true): v2와 동일하게 검색 초기화 + 첫 항목 활성
    const nowOpen = this.open;
    if (nowOpen && !this.#lastOpen) {
      this.#search = "";
      this.#activeIdx = 0;
      this.#input.value = "";
      this.#renderResults();
    }
    this.#lastOpen = nowOpen;
  }

  #hotkeyMap(): HotkeyMap {
    return this.hotkey ? { [this.hotkey]: () => this.#toggle() } : {};
  }

  #toggle(): void {
    this.open = !this.open; // v2 ⌘K는 요청형 닫기를 거치지 않고 직접 토글
  }

  /** v2 filter: label/description/keywords 부분일치(소문자) */
  #computeFiltered(): JdCommandItem[] {
    const q = this.#search.trim().toLowerCase();
    if (!q) return this.#items.slice();
    return this.#items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        Boolean(it.description?.toLowerCase().includes(q)) ||
        Boolean(it.keywords?.some((k) => k.toLowerCase().includes(q))),
    );
  }

  /** 결과 DOM 전체 재구축 — 파생 데이터라 멱등, 스크롤/포커스는 입력에 남는다 */
  #renderResults(): void {
    const results = this.#results;
    const input = this.#input;
    if (!results || !input) return;

    const filtered = this.#computeFiltered();
    this.#filtered = filtered;
    if (this.#activeIdx > filtered.length - 1) this.#activeIdx = Math.max(0, filtered.length - 1);

    results.textContent = "";
    this.#optionEls = [];

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "jd-command-palette__empty";
      empty.textContent = this.emptyText;
      results.append(empty);
      input.removeAttribute("aria-activedescendant");
      return;
    }

    // v2와 동일하게 삽입 순서로 그룹핑
    const groups = new Map<string, JdCommandItem[]>();
    for (const it of filtered) {
      const g = it.group || "";
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(it);
    }

    let flat = 0;
    for (const [group, arr] of groups) {
      let container: HTMLElement = results;
      if (group) {
        const gc = document.createElement("div");
        gc.className = "jd-command-palette__group";
        gc.setAttribute("role", "group");
        gc.setAttribute("aria-label", group);
        const gl = document.createElement("div");
        gl.className = "jd-command-palette__group-label";
        gl.setAttribute("aria-hidden", "true");
        gl.textContent = group;
        gc.append(gl);
        results.append(gc);
        container = gc;
      }
      for (const it of arr) {
        const idx = flat++;
        const opt = document.createElement("div");
        opt.className = "jd-command-palette__option";
        opt.setAttribute("role", "option");
        opt.id = `${this.#listId}-opt-${idx}`;
        opt.dataset.idx = String(idx);
        if (it.icon) {
          const ic = document.createElement("span");
          ic.className = "jd-command-palette__option-icon";
          ic.setAttribute("aria-hidden", "true");
          setContent(ic, it.icon);
          opt.append(ic);
        }
        const body = document.createElement("div");
        body.className = "jd-command-palette__option-body";
        const label = document.createElement("div");
        label.className = "jd-command-palette__option-label";
        label.textContent = it.label;
        body.append(label);
        if (it.description) {
          const desc = document.createElement("div");
          desc.className = "jd-command-palette__option-desc";
          desc.textContent = it.description;
          body.append(desc);
        }
        opt.append(body);
        container.append(opt);
        this.#optionEls.push(opt);
      }
    }
    this.#syncActive(true);
  }

  /** 활성 항목 표시 동기화(aria-selected + activedescendant). scroll=true면 뷰로 끌어온다 */
  #syncActive(scroll = false): void {
    const input = this.#input;
    if (!input) return;
    const els = this.#optionEls;
    for (let i = 0; i < els.length; i++) {
      els[i]!.setAttribute("aria-selected", i === this.#activeIdx ? "true" : "false");
    }
    const active = els[this.#activeIdx];
    if (active) {
      input.setAttribute("aria-activedescendant", active.id);
      if (scroll) active.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  #execute(item: JdCommandItem): void {
    item.action?.();
    this.emit("jd-select", { id: item.id });
    this.open = false; // v2: 선택 시 즉시 닫힘(요청형 닫기 우회)
  }

  #onInput = (): void => {
    if (!this.#input) return;
    this.#search = this.#input.value;
    this.#activeIdx = 0;
    this.#renderResults();
  };

  #onInputKeydown = (e: KeyboardEvent): void => {
    const n = this.#filtered.length;
    switch (e.key) {
      case "ArrowDown":
        if (!n) return;
        e.preventDefault();
        this.#activeIdx = Math.min(this.#activeIdx + 1, n - 1);
        this.#syncActive(true);
        break;
      case "ArrowUp":
        if (!n) return;
        e.preventDefault();
        this.#activeIdx = Math.max(this.#activeIdx - 1, 0);
        this.#syncActive(true);
        break;
      case "Home":
        if (!n) return;
        e.preventDefault();
        this.#activeIdx = 0;
        this.#syncActive(true);
        break;
      case "End":
        if (!n) return;
        e.preventDefault();
        this.#activeIdx = n - 1;
        this.#syncActive(true);
        break;
      case "Enter": {
        const item = this.#filtered[this.#activeIdx];
        if (item) {
          e.preventDefault();
          this.#execute(item);
        }
        break;
      }
      // Escape는 Modal 문서 리스너가 처리(jd-request-close → 닫힘)
    }
  };

  #onResultsClick = (e: Event): void => {
    const target = e.target as HTMLElement | null;
    const opt = target?.closest<HTMLElement>(".jd-command-palette__option");
    if (!opt || !this.#results?.contains(opt)) return;
    const idx = Number(opt.dataset.idx);
    const item = this.#filtered[idx];
    if (item) this.#execute(item);
  };

  /** 포인터가 실제로 움직였을 때만 활성 이동 — 키보드 스크롤이 유발하는 유령 이동 무시 */
  #onResultsPointerMove = (e: PointerEvent): void => {
    if (e.clientX === this.#lastPx && e.clientY === this.#lastPy) return;
    this.#lastPx = e.clientX;
    this.#lastPy = e.clientY;
    const target = e.target as HTMLElement | null;
    const opt = target?.closest<HTMLElement>(".jd-command-palette__option");
    if (!opt) return;
    const idx = Number(opt.dataset.idx);
    if (Number.isNaN(idx) || idx === this.#activeIdx) return;
    this.#activeIdx = idx;
    this.#syncActive(false); // hover는 스크롤 유발 금지
  };
}
