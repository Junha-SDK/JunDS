/**
 * <jd-sidebar-provider> — 사이드바 접힘 상태의 단일 소유자 (v2 patterns/Sidebar의
 * DsSidebarProvider = React Context).
 *
 * React는 Context로 collapsed를 내려보냈지만 light DOM CE엔 Context가 없다. 대신
 * 상태를 **reflect되는 attribute**(`[collapsed]`)로 노출하고, 자손(jd-sidebar·
 * jd-sidebar-link·jd-sidebar-section)은 그 조상 attribute를 **CSS 자손 조합자**로
 * 읽는다(§4.3). 즉 접힘 반응은 JS 구독 없이 전부 CSS가 처리한다 — v2가 매 자손에서
 * useSidebar()를 호출하던 것을 캐스케이드 한 줄로 대체한다.
 *
 * 프로바이더 자체는 DOM 상자를 만들지 않는다(v2가 children만 반환한 것과 동형) —
 * CSS `display: contents`. 상태 전이 시 `jd-collapse`(사후) 이벤트를 발행해
 * 외부 토글(헤더 햄버거 등)이 aria를 동기화할 수 있게 한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import sidebarProviderStyles from "./sidebar-provider.css.js";

export class JdSidebarProvider extends JdElement {
  static override tag = "jd-sidebar-provider";
  static override props = {
    collapsed: { type: Boolean, reflect: true },
    /** 최초 접힘 여부 — collapsed의 초기값만 심는다(명시 collapsed attribute가 이긴다) */
    defaultCollapsed: { type: Boolean },
  };

  declare collapsed: boolean;
  declare defaultCollapsed: boolean;

  #was = false;
  #seeded = false;

  protected render(): void {
    adoptStyles(sidebarProviderStyles);
    if (!this.#seeded) {
      this.#seeded = true;
      // default-collapsed는 초기 seed 전용 — 사용자가 collapsed를 직접 지정하면 그 값이 우선
      if (this.defaultCollapsed && !this.hasAttribute("collapsed")) this.collapsed = true;
    }
    this.#was = this.collapsed;
    this.update();
  }

  /** 접힘 토글 — jd-sidebar 토글 버튼·외부 컨트롤의 단일 진입점 */
  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  setCollapsed(v: boolean): void {
    this.collapsed = v;
  }

  protected override update(): void {
    if (this.collapsed !== this.#was) {
      this.#was = this.collapsed;
      this.emit("jd-collapse", { collapsed: this.collapsed });
    }
  }
}
