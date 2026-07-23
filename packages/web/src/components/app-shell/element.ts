/**
 * <jd-app-shell> — 사이드바+헤더+본문+푸터 앱 골격 (v2 layout/AppShell).
 *
 * light DOM 슬롯(DEC-014-4 규약 동형): slot="sidebar" / slot="header" / slot="footer",
 * 나머지 children = 본문. 데스크톱은 접힘 레일, 모바일(breakpoint 미만)은 오버레이
 * 드로어 — v2는 조건부 렌더로 두 aside를 갈아끼웠지만 CE는 단일 aside를 상태
 * 속성([data-mobile]·[mobile-open])으로 전환한다(콘텐츠 이동 없음).
 *
 * - Ctrl/Cmd+B: 데스크톱 = sidebar-collapsed 토글(+ jd-sidebar-toggle 사후 통지),
 *   모바일 = 드로어 토글. defaultPrevented 존중(레포 선례: ⌘K 이중 토글 픽스).
 * - 모바일 드로어 열림 동안 body 스크롤 락(v2 동형).
 * - 폭 값은 CSS 변수(--_jd-shell-*)로 반영 — 전환 transition은 CSS가 담당.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { resolveSpace } from "../../core/style-props.js";
import appShellStyles from "./app-shell.css.js";

const MENU_SVG =
  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">` +
  `<path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdAppShell extends JdElement {
  static override tag = "jd-app-shell";
  static override props = {
    sidebarWidth: { type: Number, default: 260 },
    collapsedWidth: { type: Number, default: 64 },
    sidebarCollapsed: { type: Boolean, reflect: true },
    mobileOpen: { type: Boolean, reflect: true },
    mobileBreakpoint: { type: Number, default: 768 },
    contentPadding: { type: String }, // spacing 토큰 — 본문 패딩
    stickyHeader: { type: Boolean, reflect: true },
  };

  declare sidebarWidth: number;
  declare collapsedWidth: number;
  declare sidebarCollapsed: boolean;
  declare mobileOpen: boolean;
  declare mobileBreakpoint: number;
  declare contentPadding: string;
  declare stickyHeader: boolean;

  #sidebar: HTMLElement | null = null;
  #backdrop: HTMLDivElement | null = null;
  #content!: HTMLElement;
  #mql: MediaQueryList | null = null;

  protected render(): void {
    adoptStyles(appShellStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-app-shell__main");
    if (existing) {
      this.#sidebar = this.querySelector(":scope > .jd-app-shell__sidebar");
      this.#backdrop = this.querySelector(":scope > .jd-app-shell__backdrop");
      this.#content = existing.querySelector(".jd-app-shell__content")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const pick = (name: string): Node[] =>
      [...this.childNodes].filter(
        (n) => n instanceof Element && n.getAttribute("slot") === name,
      );
    const sidebarNodes = pick("sidebar");
    const headerNodes = pick("header");
    const footerNodes = pick("footer");
    const rest = [...this.childNodes].filter(
      (n) => !(n instanceof Element && ["sidebar", "header", "footer"].includes(n.getAttribute("slot") ?? "")),
    );

    if (sidebarNodes.length) {
      this.#backdrop = document.createElement("div");
      this.#backdrop.className = "jd-app-shell__backdrop";
      this.#backdrop.setAttribute("aria-hidden", "true");
      this.#sidebar = document.createElement("aside");
      this.#sidebar.className = "jd-app-shell__sidebar";
      this.#sidebar.append(...sidebarNodes);
      this.append(this.#backdrop, this.#sidebar);
    }

    const main = document.createElement("div");
    main.className = "jd-app-shell__main";

    if (headerNodes.length) {
      const header = document.createElement("header");
      header.className = "jd-app-shell__header";
      if (sidebarNodes.length) {
        const menu = document.createElement("button");
        menu.type = "button";
        menu.className = "jd-app-shell__menu";
        menu.setAttribute("aria-label", "사이드바 열기");
        menu.innerHTML = MENU_SVG;
        header.append(menu);
      }
      header.append(...headerNodes);
      main.append(header);
    }

    this.#content = document.createElement("main");
    this.#content.className = "jd-app-shell__content";
    this.#content.append(...rest);
    main.append(this.#content);

    if (footerNodes.length) {
      const footer = document.createElement("footer");
      footer.className = "jd-app-shell__footer";
      footer.append(...footerNodes);
      main.append(footer);
    }

    this.append(main);
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
    document.addEventListener("keydown", this.#onKeydown);
    this.#mql = matchMedia(`(max-width: ${this.mobileBreakpoint - 1}px)`);
    this.#mql.addEventListener("change", this.#onMedia);
    this.#syncMobile(this.#mql.matches);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
    document.removeEventListener("keydown", this.#onKeydown);
    this.#mql?.removeEventListener("change", this.#onMedia);
    this.#mql = null;
    this.#unlockScroll();
  }

  #onMedia = (e: MediaQueryListEvent): void => {
    this.#syncMobile(e.matches);
  };

  #syncMobile(mobile: boolean): void {
    this.toggleAttribute("data-mobile", mobile);
    if (!mobile && this.mobileOpen) this.mobileOpen = false; // 데스크톱 복귀 시 드로어 닫힘
    this.requestUpdate();
  }

  #onClick = (e: Event): void => {
    const t = e.target as Element;
    if (t.closest(".jd-app-shell__menu")) this.mobileOpen = true;
    else if (t.closest(".jd-app-shell__backdrop")) this.mobileOpen = false;
  };

  #onKeydown = (e: KeyboardEvent): void => {
    if (e.defaultPrevented) return; // ⌘K 이중 토글 선례 — 선점된 단축키 존중
    if (!(e.ctrlKey || e.metaKey) || e.key !== "b") return;
    e.preventDefault();
    if (this.hasAttribute("data-mobile")) {
      this.mobileOpen = !this.mobileOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      this.emit("jd-sidebar-toggle", { collapsed: this.sidebarCollapsed });
    }
  };

  #locked = false;
  #lockScroll(): void {
    if (this.#locked) return;
    this.#locked = true;
    document.body.style.overflow = "hidden";
  }
  #unlockScroll(): void {
    if (!this.#locked) return;
    this.#locked = false;
    document.body.style.overflow = "";
  }

  protected override update(): void {
    const rail = this.sidebarCollapsed ? this.collapsedWidth : this.sidebarWidth;
    this.style.setProperty("--_jd-shell-rail", `${rail}px`);
    this.style.setProperty("--_jd-shell-drawer", `${this.sidebarWidth}px`);

    const pad = this.contentPadding ? resolveSpace(this.contentPadding) : null;
    if (pad) this.#content.style.setProperty("padding", pad);
    else this.#content.style.removeProperty("padding");

    if (this.hasAttribute("data-mobile") && this.mobileOpen) this.#lockScroll();
    else this.#unlockScroll();
  }
}
