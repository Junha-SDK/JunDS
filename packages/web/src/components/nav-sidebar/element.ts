/**
 * <jd-nav-sidebar> — 섹션형 세로 내비게이션 레일 (v2 finance/Sidebar).
 *
 * 태그: `jd-sidebar`는 이미 v2 patterns/Sidebar(접힘 레일 DsSidebar)가 차지했다.
 * 이건 그것과 구조가 다른 **데이터 구동 섹션 내비**(로고 헤더 + 그룹 섹션 + ⌘K 푸터)라
 * 별도 태그 `jd-nav-sidebar`로 둔다.
 *
 * v2는 NAV_SECTIONS·라우트·활성 판정·알림 배지를 컴포넌트 안에 하드코딩했다(앱 그 자체
 * 였으므로). DS 컴포넌트로는 그 결합을 걷어낸다:
 *  - 항목은 `sections` 프로퍼티 / JSON 슬롯으로 받는다(§1.3 배열 attribute 금지).
 *  - 현재 경로는 `activePath`로 받아 활성 항목을 계산한다(v2 usePathname 대체).
 *  - 로고·최근본종목·⌘K는 도메인 위젯이므로 light DOM 슬롯(slot=header/top/footer)으로
 *    받는다(app-shell/jd-sidebar 슬롯 선례).
 *  - 아이콘은 <jd-app-icon name>, 배지는 <jd-badge>를 합성한다(둘 다 index에서 등록 보장).
 *
 * v2보다 나은 점: role=navigation + 접근 이름, 활성 항목 aria-current=page,
 * 링크 클릭 시 jd-navigate 발행(SPA 라우팅 훅).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import navSidebarStyles from "./nav-sidebar.css.js";

export interface JdNavItem {
  href: string;
  label: string;
  /** jd-app-icon 이름 */
  icon?: string;
  /** 0보다 클 때만 노출되는 danger 배지 */
  badge?: number;
  /** href 외에 활성으로 볼 경로들(접두 매칭) */
  matchPaths?: string[];
}

export interface JdNavSection {
  title: string;
  items: JdNavItem[];
}

export class JdNavSidebar extends JdElement {
  static override tag = "jd-nav-sidebar";
  static override props = {
    /** 현재 경로 — 활성 항목 계산 (v2 usePathname) */
    activePath: { type: String, reflect: true },
    /** nav 접근 이름 */
    label: { type: String, default: "주요 메뉴" },
    /** 펼친 폭(px) — v2 248 */
    width: { type: Number, default: 248 },
  };

  declare activePath: string;
  declare label: string;
  declare width: number;

  #sections: JdNavSection[] = [];
  #built: readonly JdNavSection[] | null = null;
  #nav!: HTMLElement;
  #itemRefs: { link: HTMLAnchorElement; item: JdNavItem }[] = [];

  get sections(): JdNavSection[] {
    return this.#sections;
  }
  set sections(v: JdNavSection[]) {
    this.#sections = Array.isArray(v) ? v : [];
    this.#built = null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(navSidebarStyles);
    this.#upgradeOwn("sections");
    this.#readJsonSlot();
    this.setAttribute("role", "navigation");

    let nav = this.querySelector<HTMLElement>(":scope > .jd-nav-sidebar__nav");
    if (nav) {
      this.#nav = nav;
      this.#built = null; // 입양 마크업의 항목은 새로 반영
    } else {
      const header = document.createElement("div");
      header.className = "jd-nav-sidebar__header";
      nav = document.createElement("nav");
      nav.className = "jd-nav-sidebar__nav";
      const top = document.createElement("div");
      top.className = "jd-nav-sidebar__top";
      nav.append(top);
      const footer = document.createElement("div");
      footer.className = "jd-nav-sidebar__footer";

      // 남은 light DOM children을 슬롯별로 이동 (script 슬롯은 이미 제거됨)
      for (const child of Array.from(this.children)) {
        const slot = child.getAttribute("slot");
        if (slot === "header") header.append(child);
        else if (slot === "footer") footer.append(child);
        else if (slot === "top") top.append(child);
      }
      this.#nav = nav;
      this.append(header, nav, footer);
      header.hidden = header.childElementCount === 0;
      top.hidden = top.childElementCount === 0;
      footer.hidden = footer.childElementCount === 0;
    }

    this.#syncSections();
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (radio-group·tabs 선례) */
  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdNavSection[];
      if (Array.isArray(parsed)) this.#sections = parsed;
    } catch {
      console.warn("[junds] <jd-nav-sidebar> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 섹션 DOM 재구축 — 배열 identity가 바뀔 때만 (tabs #built 선례) */
  #syncSections(): void {
    this.#built = this.#sections;
    this.#itemRefs = [];
    for (const old of this.#nav.querySelectorAll<HTMLElement>(":scope > .jd-nav-sidebar__section")) {
      old.remove();
    }
    for (const section of this.#sections) {
      const block = document.createElement("div");
      block.className = "jd-nav-sidebar__section";

      const title = document.createElement("div");
      title.className = "jd-nav-sidebar__section-title";
      title.textContent = (section.title ?? "").toUpperCase();
      title.hidden = !section.title;

      const list = document.createElement("ul");
      list.className = "jd-nav-sidebar__list";

      for (const item of section.items ?? []) {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.className = "jd-nav-sidebar__link";
        link.href = item.href;

        const rail = document.createElement("span");
        rail.className = "jd-nav-sidebar__rail";
        rail.setAttribute("aria-hidden", "true");

        const icon = document.createElement("span");
        icon.className = "jd-nav-sidebar__icon";
        icon.setAttribute("aria-hidden", "true");
        if (item.icon) {
          const glyph = document.createElement("jd-app-icon");
          glyph.setAttribute("name", item.icon);
          glyph.setAttribute("size", "16");
          glyph.setAttribute("stroke-width", "2");
          icon.append(glyph);
        }

        const label = document.createElement("span");
        label.className = "jd-nav-sidebar__label";
        label.textContent = item.label;

        link.append(rail, icon, label);

        if (typeof item.badge === "number" && item.badge > 0) {
          const badge = document.createElement("jd-badge");
          badge.setAttribute("variant", "danger");
          badge.setAttribute("size", "sm");
          badge.textContent = String(item.badge);
          link.append(badge);
        }

        li.append(link);
        list.append(li);
        this.#itemRefs.push({ link, item });
      }

      block.append(title, list);
      this.#nav.append(block);
    }
  }

  protected override update(): void {
    if (this.#built !== this.#sections) this.#syncSections();
    this.setAttribute("aria-label", this.label);
    this.style.setProperty("--jd-nav-sidebar-width", `${this.width}px`);

    const path = this.activePath;
    for (const { link, item } of this.#itemRefs) {
      const active = this.#isActive(path, item);
      link.toggleAttribute("data-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  }

  /** v2 판정: path === href || matchPaths 접두 매칭 */
  #isActive(path: string, item: JdNavItem): boolean {
    if (!path) return false;
    if (path === item.href) return true;
    return (
      item.matchPaths?.some((p) => path === p || path.startsWith(`${p}/`)) ?? false
    );
  }

  #onClick = (e: Event): void => {
    const link = (e.target as Element | null)?.closest("a.jd-nav-sidebar__link");
    if (!link || !this.contains(link)) return;
    this.emit("jd-navigate", { href: (link as HTMLAnchorElement).getAttribute("href") ?? "" });
  };
}
