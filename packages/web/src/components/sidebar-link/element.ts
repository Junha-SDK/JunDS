/**
 * <jd-sidebar-link> — 사이드바 항목 (v2 patterns/Sidebar의 SidebarLink).
 *
 * v2 대비 개선: v2는 active를 시각(색·좌측 보더)으로만 표기했다 — 여기서는
 * `aria-current="page"`를 얹고, 접힘 시 사라지는 라벨을 `aria-label`로 보존해
 * 아이콘만 남아도 접근 이름이 유지된다. 좌측 활성 보더는 항상 2px(비활성=투명)이라
 * 상태 전환에 레이아웃 밀림이 없다(v2의 border-l-2 토글은 2px 시프트가 있었다).
 *
 * 아이콘은 노드이므로 attribute가 아니라 slot="icon" 자식으로 받는다(§1.3).
 * 라벨/badge 숨김은 조상 `[collapsed]`를 CSS가 읽어 처리한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import sidebarLinkStyles from "./sidebar-link.css.js";

export class JdSidebarLink extends JdElement {
  static override tag = "jd-sidebar-link";
  static override props = {
    href: { type: String },
    label: { type: String },
    active: { type: Boolean, reflect: true },
    /** 미읽음/카운트 배지 — 0 이하면 숨김(v2: badge > 0일 때만) */
    badge: { type: Number },
  };

  declare href: string;
  declare label: string;
  declare active: boolean;
  declare badge: number;

  #anchor!: HTMLAnchorElement;
  #label!: HTMLElement;
  #badge!: HTMLElement;

  protected render(): void {
    adoptStyles(sidebarLinkStyles);
    const existing = this.querySelector<HTMLAnchorElement>(":scope > .jd-sidebar-link__anchor");
    if (existing) {
      this.#anchor = existing;
      this.#label = existing.querySelector(".jd-sidebar-link__label")!;
      this.#badge = existing.querySelector(".jd-sidebar-link__badge")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const iconNode = this.querySelector(':scope > [slot="icon"]');
    this.#anchor = document.createElement("a");
    this.#anchor.className = "jd-sidebar-link__anchor";

    const icon = document.createElement("span");
    icon.className = "jd-sidebar-link__icon";
    icon.setAttribute("aria-hidden", "true");
    if (iconNode) icon.append(iconNode);

    this.#label = document.createElement("span");
    this.#label.className = "jd-sidebar-link__label";

    this.#badge = document.createElement("span");
    this.#badge.className = "jd-sidebar-link__badge";

    this.#anchor.append(icon, this.#label, this.#badge);
    this.append(this.#anchor);
  }

  protected override update(): void {
    this.#anchor.setAttribute("href", this.href || "#");
    this.#label.textContent = this.label;
    if (this.label) this.#anchor.setAttribute("aria-label", this.label);
    else this.#anchor.removeAttribute("aria-label");

    if (this.active) this.#anchor.setAttribute("aria-current", "page");
    else this.#anchor.removeAttribute("aria-current");

    const n = this.badge;
    if (n > 0) {
      this.#badge.hidden = false;
      this.#badge.textContent = n > 99 ? "99+" : String(n);
    } else {
      this.#badge.hidden = true;
    }
  }
}
