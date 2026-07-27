/**
 * <jd-bottom-nav> — 모바일 하단 탭바 + "더보기" 시트 (v2 finance/BottomNav).
 *
 * v2는 Next(Link/usePathname)에 직접 묶여 앱 라우트(TABS·SHEET_SECTIONS)를
 * **컴포넌트 안에 하드코딩**했고, 시트 오버레이(백드롭·닫기)를 손으로 짰다.
 * v3는 둘 다 걷어낸다:
 *  - 라우트는 소비자가 `tabs`/`sections` 프로퍼티(또는 JSON 슬롯)로 공급하고,
 *    현재 경로는 `activePath`로 되먹인다(§6.3 — 컴포넌트는 데이터를 받기만).
 *  - 링크는 네이티브 `<a href>` — MPA는 그대로 이동, SPA는 jd-navigate로 가로챈다.
 *  - "더보기" 시트는 **jd-bottom-sheet를 합성**해 재사용한다(§6 R12) — 포커스 감금·
 *    ESC·백드롭 닫기·스크롤 락이 공짜로 붙는다(v2엔 없던 접근성).
 *
 * 활성 규칙(v2 동일): 탭은 activePath===href 또는 matchPaths 접두 일치. 어느 탭도
 * 안 맞으면 "더보기"가 활성. 라우트가 바뀌면(=activePath 변경) 시트를 자동으로 닫는다.
 */
import { JdElement } from "../../core/element.js";
import { setContent, type JdContent } from "../../core/content.js";
import { adoptStyles } from "../../core/styles.js";
// 합성 대상 <jd-bottom-sheet>의 **정의**(side-effect)는 index.ts가 보장한다 —
// element.ts는 부작용 0 규약을 지켜 타입만 가져온다(§6.3).
import type { JdBottomSheet } from "../bottom-sheet/element.js";
import bottomNavStyles from "./bottom-nav.css.js";

export interface JdBottomNavTab {
  href: string;
  label: string;
  /** 아이콘. 문자열(평문), DOM 노드 또는 `unsafeHtml()`로 표시한 값 */
  icon?: JdContent;
  /** 접두 일치로 활성 판정할 추가 경로 */
  matchPaths?: string[];
}

export interface JdBottomNavSheetItem {
  href: string;
  label: string;
  /** 아이콘. 문자열(평문), DOM 노드 또는 `unsafeHtml()`로 표시한 값 */
  icon?: JdContent;
  description?: string;
}

export interface JdBottomNavSection {
  title: string;
  items: JdBottomNavSheetItem[];
}

/** lucide "menu" — 더보기 트리거 기본 아이콘 */
const MENU_SVG =
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"` +
  ` stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/>` +
  `<line x1="4" y1="18" x2="20" y2="18"/></svg>`;

export class JdBottomNav extends JdElement {
  static override tag = "jd-bottom-nav";
  static override props = {
    /** 현재 경로 — 소비자가 라우트마다 되먹인다 */
    activePath: { type: String, reflect: true, attribute: "active-path" },
    label: { type: String, default: "하단 탐색" },
    moreLabel: { type: String, default: "더보기", attribute: "more-label" },
  };

  declare activePath: string;
  declare label: string;
  declare moreLabel: string;

  #tabs: JdBottomNavTab[] = [];
  #sections: JdBottomNavSection[] = [];

  #bar: HTMLElement | null = null;
  #more: HTMLButtonElement | null = null;
  #sheet: JdBottomSheet | null = null;
  #sheetBody: HTMLElement | null = null;
  #tabsDirty = true;
  #sectionsDirty = true;
  #lastPath: string | null = null;

  get tabs(): JdBottomNavTab[] {
    return this.#tabs;
  }
  set tabs(v: JdBottomNavTab[]) {
    this.#tabs = Array.isArray(v) ? v : [];
    this.#tabsDirty = true;
    this.requestUpdate();
  }

  get sections(): JdBottomNavSection[] {
    return this.#sections;
  }
  set sections(v: JdBottomNavSection[]) {
    this.#sections = Array.isArray(v) ? v : [];
    this.#sectionsDirty = true;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(bottomNavStyles);
    this.#readJson();

    // 입양(§3.3): 프리렌더 골격이 있으면 재사용
    this.#bar = this.querySelector<HTMLElement>(":scope > .jd-bottom-nav__bar");
    if (!this.#bar) {
      this.#bar = document.createElement("nav");
      this.#bar.className = "jd-bottom-nav__bar";
      this.append(this.#bar);
    }

    this.#sheet = this.querySelector<JdBottomSheet>(":scope > jd-bottom-sheet");
    if (!this.#sheet) {
      this.#sheet = document.createElement("jd-bottom-sheet") as JdBottomSheet;
      this.#sheet.className = "jd-bottom-nav__sheet";
      this.#sheetBody = document.createElement("div");
      this.#sheetBody.className = "jd-bottom-nav__sheet-body";
      this.#sheet.append(this.#sheetBody); // jd-bottom-sheet가 panel로 이동시킴
      this.append(this.#sheet);
    } else {
      this.#sheetBody = this.#sheet.querySelector(".jd-bottom-nav__sheet-body");
    }

    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as {
        tabs?: JdBottomNavTab[];
        sections?: JdBottomNavSection[];
      };
      if (Array.isArray(parsed.tabs)) this.#tabs = parsed.tabs;
      if (Array.isArray(parsed.sections)) this.#sections = parsed.sections;
    } catch {
      /* 잘못된 JSON은 무시 */
    }
    script.remove();
  }

  protected override connected(): void {
    this.#bar?.addEventListener("click", this.#onBarClick);
    this.#sheet?.addEventListener("click", this.#onSheetClick);
    this.#sheet?.addEventListener("jd-close", this.#onSheetClose);
  }

  protected override disconnected(): void {
    this.#bar?.removeEventListener("click", this.#onBarClick);
    this.#sheet?.removeEventListener("click", this.#onSheetClick);
    this.#sheet?.removeEventListener("jd-close", this.#onSheetClose);
  }

  #tabActive(tab: JdBottomNavTab): boolean {
    const p = this.activePath;
    if (!p) return false;
    if (p === tab.href) return true;
    return (tab.matchPaths ?? []).some((m) => p === m || p.startsWith(`${m}/`));
  }

  protected override update(): void {
    this.setAttribute("role", "navigation");
    this.setAttribute("aria-label", this.label);
    // 시트에 접근 이름 부여(v2 헤더 "더보기") — 손잡이·제목 표시 겸 dialog 라벨
    this.#sheet?.setAttribute("title", this.moreLabel || "더보기");

    if (this.#tabsDirty) {
      this.#rebuildBar();
      this.#tabsDirty = false;
    }
    if (this.#sectionsDirty) {
      this.#rebuildSheet();
      this.#sectionsDirty = false;
    }

    // 라우트 변경 시 시트 자동 닫기(v2 useEffect)
    if (this.#lastPath !== null && this.#lastPath !== this.activePath && this.#sheet?.open) {
      this.#sheet.open = false;
    }
    this.#lastPath = this.activePath;

    // 활성 표시 동기화 — 더보기 트리거(.jd-bottom-nav__more)도 .jd-bottom-nav__tab을
    // 갖고 있으므로 실제 탭만 골라 인덱스를 #tabs와 정렬한다(안 그러면 undefined 접근).
    const anyTabActive = this.#tabs.some((t) => this.#tabActive(t));
    const tabEls =
      this.#bar?.querySelectorAll<HTMLElement>(
        ".jd-bottom-nav__tab:not(.jd-bottom-nav__more)",
      ) ?? [];
    tabEls.forEach((el, i) => {
      const tab = this.#tabs[i];
      if (!tab) return;
      const active = this.#tabActive(tab);
      el.toggleAttribute("data-active", active);
      el.setAttribute("aria-current", active ? "page" : "false");
    });
    if (this.#more) {
      this.#more.toggleAttribute("data-active", !anyTabActive);
      this.#more.setAttribute("aria-expanded", String(Boolean(this.#sheet?.open)));
    }
    const itemEls = this.#sheetBody?.querySelectorAll<HTMLElement>(".jd-bottom-nav__sheet-item") ?? [];
    let idx = 0;
    for (const section of this.#sections) {
      for (const item of section.items) {
        const el = itemEls[idx++];
        if (el) el.toggleAttribute("data-active", this.activePath === item.href);
      }
    }
  }

  #rebuildBar(): void {
    const bar = this.#bar;
    if (!bar) return;
    bar.textContent = "";
    for (const tab of this.#tabs) {
      const a = document.createElement("a");
      a.className = "jd-bottom-nav__tab";
      a.href = tab.href;
      const icon = document.createElement("span");
      icon.className = "jd-bottom-nav__tab-icon";
      icon.setAttribute("aria-hidden", "true");
      setContent(icon, tab.icon);
      const text = document.createElement("span");
      text.className = "jd-bottom-nav__tab-label";
      text.textContent = tab.label;
      a.append(icon, text);
      bar.append(a);
    }
    // 더보기 트리거
    this.#more = document.createElement("button");
    this.#more.type = "button";
    this.#more.className = "jd-bottom-nav__tab jd-bottom-nav__more";
    this.#more.setAttribute("aria-haspopup", "dialog");
    const mIcon = document.createElement("span");
    mIcon.className = "jd-bottom-nav__tab-icon";
    mIcon.setAttribute("aria-hidden", "true");
    mIcon.innerHTML = MENU_SVG;
    const mText = document.createElement("span");
    mText.className = "jd-bottom-nav__tab-label";
    mText.textContent = this.moreLabel;
    this.#more.append(mIcon, mText);
    bar.append(this.#more);
  }

  #rebuildSheet(): void {
    const body = this.#sheetBody;
    if (!body) return;
    body.textContent = "";
    for (const section of this.#sections) {
      const sec = document.createElement("section");
      sec.className = "jd-bottom-nav__sheet-section";
      const title = document.createElement("div");
      title.className = "jd-bottom-nav__sheet-title";
      title.textContent = section.title.toUpperCase();
      const list = document.createElement("ul");
      list.className = "jd-bottom-nav__sheet-list";
      for (const item of section.items) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "jd-bottom-nav__sheet-item";
        a.href = item.href;
        const icon = document.createElement("span");
        icon.className = "jd-bottom-nav__sheet-icon";
        icon.setAttribute("aria-hidden", "true");
        setContent(icon, item.icon);
        const label = document.createElement("span");
        label.className = "jd-bottom-nav__sheet-label";
        label.textContent = item.label;
        a.append(icon, label);
        if (item.description) {
          const desc = document.createElement("span");
          desc.className = "jd-bottom-nav__sheet-desc";
          desc.textContent = item.description;
          a.append(desc);
        }
        li.append(a);
        list.append(li);
      }
      sec.append(title, list);
      body.append(sec);
    }
  }

  #onBarClick = (e: Event): void => {
    const more = (e.target as HTMLElement | null)?.closest(".jd-bottom-nav__more");
    if (more) {
      if (this.#sheet) this.#sheet.open = true;
      this.#more?.setAttribute("aria-expanded", "true");
      return;
    }
    const tab = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(".jd-bottom-nav__tab");
    if (tab && this.#bar?.contains(tab)) {
      this.emit("jd-navigate", { href: tab.href });
    }
  };

  #onSheetClick = (e: Event): void => {
    const item = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
      ".jd-bottom-nav__sheet-item",
    );
    if (!item) return;
    this.emit("jd-navigate", { href: item.href });
    if (this.#sheet) this.#sheet.open = false;
  };

  #onSheetClose = (): void => {
    this.#more?.setAttribute("aria-expanded", "false");
  };
}
