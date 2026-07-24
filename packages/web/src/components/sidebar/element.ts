/**
 * <jd-sidebar> — 세로 내비 레일 (v2 patterns/Sidebar의 DsSidebar).
 *
 * light DOM 슬롯(app-shell 선례): slot="header" / slot="footer", 나머지 children =
 * 본문 nav. v2의 header/footer ReactNode 프롭을 슬롯으로 옮긴 것.
 *
 * 접힘 상태는 조상 <jd-sidebar-provider>가 소유한다 — 토글 버튼은 프로바이더를
 * 찾아 toggle()을 호출하고, 프로바이더가 없으면 자신의 `collapsed`를 뒤집는다(자립).
 * 접힘 폭·아이콘 회전은 CSS가 조상/자신의 `[collapsed]`를 읽어 처리하므로 이 클래스는
 * 폭 토큰을 CSS 변수로 반영하고 토글 aria만 동기화한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import sidebarStyles from "./sidebar.css.js";

const CHEVRON_SVG =
  `<svg class="jd-sidebar__toggle-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<path d="M7.5 2.5l-3 3.5 3 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

type CollapseHost = Element & { collapsed?: boolean; toggle?: () => void };

export class JdSidebar extends JdElement {
  static override tag = "jd-sidebar";
  static override props = {
    /** 펼친 폭(px) — v2 width */
    width: { type: Number, default: 264 },
    /** 접힌 폭(px) — v2 collapsedWidth */
    collapsedWidth: { type: Number, default: 68 },
    /** 프로바이더가 없을 때의 자립 접힘 상태 */
    collapsed: { type: Boolean, reflect: true },
  };

  declare width: number;
  declare collapsedWidth: number;
  declare collapsed: boolean;

  #nav!: HTMLElement;
  #toggle: HTMLButtonElement | null = null;
  #provider: CollapseHost | null = null;

  protected render(): void {
    adoptStyles(sidebarStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-sidebar__nav");
    if (existing) {
      this.#nav = existing;
      this.#toggle = this.querySelector(":scope > .jd-sidebar__toggle");
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
    const headerNodes = pick("header");
    const footerNodes = pick("footer");
    const rest = [...this.childNodes].filter(
      (n) =>
        !(n instanceof Element && ["header", "footer"].includes(n.getAttribute("slot") ?? "")),
    );

    if (headerNodes.length) {
      const header = document.createElement("div");
      header.className = "jd-sidebar__header";
      header.append(...headerNodes);
      this.append(header);
    }

    this.#nav = document.createElement("nav");
    this.#nav.className = "jd-sidebar__nav";
    this.#nav.append(...rest);
    this.append(this.#nav);

    if (footerNodes.length) {
      const footer = document.createElement("div");
      footer.className = "jd-sidebar__footer";
      footer.append(...footerNodes);
      this.append(footer);
    }

    this.#toggle = document.createElement("button");
    this.#toggle.type = "button";
    this.#toggle.className = "jd-sidebar__toggle";
    this.#toggle.setAttribute("aria-label", "사이드바 접기/펼치기");
    this.#toggle.innerHTML = CHEVRON_SVG;
    this.append(this.#toggle);
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
    this.#provider = this.closest<CollapseHost>("jd-sidebar-provider");
    this.#provider?.addEventListener("jd-collapse", this.#onProviderCollapse);
    this.requestUpdate();
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
    this.#provider?.removeEventListener("jd-collapse", this.#onProviderCollapse);
    this.#provider = null;
  }

  #onClick = (e: Event): void => {
    if (!(e.target as Element).closest(".jd-sidebar__toggle")) return;
    if (this.#provider?.toggle) this.#provider.toggle();
    else this.collapsed = !this.collapsed;
  };

  #onProviderCollapse = (): void => {
    this.requestUpdate();
  };

  #isCollapsed(): boolean {
    return this.#provider ? Boolean(this.#provider.collapsed) : this.collapsed;
  }

  protected override update(): void {
    this.style.setProperty("--_jd-sb-w", `${this.width}px`);
    this.style.setProperty("--_jd-sb-cw", `${this.collapsedWidth}px`);
    // 토글은 레일을 펼침(expanded)/접힘 사이에서 여닫는다
    this.#toggle?.setAttribute("aria-expanded", String(!this.#isCollapsed()));
  }
}
