/**
 * <jd-drawer> — 가장자리에서 밀려 나오는 패널 (v2 composites/Drawer) = Modal 파생.
 *
 * v2는 Drawer·BottomSheet·Sheet·ActionSheet가 **각자** ESC 리스너·body 스크롤 락·
 * 백드롭을 다시 구현했다(넷 다 미묘하게 달랐다 — Drawer만 dismissible, BottomSheet만
 * transition, ActionSheet는 ESC 없음). v3는 그 전부를 jd-modal 하나가 갖고,
 * 파생은 **패널 기하와 골격만** 재정의한다(§6 R12). 포커스 감금·요청형 닫기
 * (jd-request-close)·재연결 복원이 공짜로 따라온다 — v2에는 셋 다 없었다.
 */
import { JdModal } from "../modal/element.js";
import { adoptStyles } from "../../core/styles.js";
import drawerStyles from "./drawer.css.js";

const CLOSE_SVG =
  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">` +
  `<path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdDrawer extends JdModal {
  static override tag = "jd-drawer";
  static override props = {
    ...JdModal.props,
    /** left | right | bottom — v2 DrawerSide */
    side: { type: String, default: "right", reflect: true },
    title: { type: String },
  };

  declare side: string;
  declare title: string;

  #header: HTMLElement | null = null;
  #titleEl: HTMLElement | null = null;

  protected override render(): void {
    super.render(); // 백드롭·패널 구축 + children 이동 + 기본 전이 적용
    adoptStyles(drawerStyles);
    this.#mountHeader();
    this.update();
  }

  /** 제목 행은 패널 맨 앞 — 본문(이동된 children)보다 위 */
  #mountHeader(): void {
    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (!panel) return;
    this.#header = panel.querySelector(":scope > .jd-drawer__header");
    if (this.#header) {
      this.#titleEl = this.#header.querySelector(".jd-drawer__title");
      return;
    }
    this.#header = document.createElement("header");
    this.#header.className = "jd-drawer__header";
    this.#titleEl = document.createElement("h2");
    this.#titleEl.className = "jd-drawer__title";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "jd-drawer__close";
    close.setAttribute("aria-label", "닫기");
    close.innerHTML = CLOSE_SVG;
    close.addEventListener("click", () => this.close());
    this.#header.append(this.#titleEl, close);
    panel.prepend(this.#header);
  }

  protected override update(): void {
    super.update();
    if (!this.#titleEl || !this.#header) return;
    this.#titleEl.textContent = this.title;
    this.#header.hidden = !this.title;
    // 제목이 있으면 그것이 다이얼로그의 접근 이름
    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (this.title) panel?.setAttribute("aria-label", this.title);
  }
}
