/**
 * <jd-notification-center> — 벨 트리거 + 알림 드롭다운 (v2 patterns/NotificationCenter)
 * = Popover 파생.
 *
 * v2는 useState(open) + useRef + useClickOutside를 직접 엮었고 ESC·포커스 복귀·
 * aria-controls가 없었다. Popover 파생으로 클릭아웃·ESC·포커스 복귀·요청형 닫기·
 * aria-expanded/haspopup/controls를 전부 상속한다 — 파생은 벨/패널 골격과 목록만 얹는다
 * (§6 R12, Dropdown 선례).
 *
 * 알림 데이터는 복합 객체라 attribute가 아니라 `notifications` 프로퍼티 또는 자식
 * <script type="application/json"> 슬롯으로 받는다(§1.3, dropdown 선례). 클릭 가능한
 * 항목은 <button>으로 만들어 키보드로 도달 가능 — v2의 onClick div(비접근) 개선.
 */
import { JdPopover } from "../popover/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import notificationCenterStyles from "./notification-center.css.js";

export interface JdNotification {
  id: string;
  title: string;
  description?: string;
  time: string;
  read?: boolean;
  /** 아이콘 — "<svg…>" 마크업 문자열(신뢰된 값만) 또는 DOM 노드 */
  icon?: string | Node;
  /** v2 호환 콜백 — jd-notification-click보다 먼저 호출된다 */
  onClick?: () => void;
}

const BELL_SVG =
  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">` +
  `<path d="M13.5 6.75a4.5 4.5 0 10-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5s-2.25-1.5-2.25-6.75M10.3 15.75a1.5 1.5 0 01-2.6 0" ` +
  `stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdNotificationCenter extends JdPopover {
  static override tag = "jd-notification-center";
  static override props = {
    ...JdPopover.props,
    /** 패널 제목 */
    heading: { type: String, default: "알림" },
    /** 빈 목록 문구 */
    emptyLabel: { type: String, default: "알림이 없습니다" },
    /** "모두 읽음" 라벨 — 빈 문자열이면 버튼 숨김 */
    markAllLabel: { type: String, default: "모두 읽음" },
    /** "비우기" 라벨 — 빈 문자열이면 버튼 숨김 */
    clearLabel: { type: String, default: "비우기" },
    /** v2 Dropdown 위치와 동형: 트리거 우측 정렬 */
    align: { type: String, default: "right", reflect: true },
  };

  declare heading: string;
  declare emptyLabel: string;
  declare markAllLabel: string;
  declare clearLabel: string;

  #notifications: JdNotification[] = [];
  #built: JdNotification[] | null = null;
  #bell: HTMLButtonElement | null = null;
  #badge: HTMLElement | null = null;
  #heading: HTMLElement | null = null;
  #markAll: HTMLButtonElement | null = null;
  #clear: HTMLButtonElement | null = null;
  #list: HTMLElement | null = null;

  get notifications(): JdNotification[] {
    return this.#notifications;
  }
  set notifications(v: JdNotification[]) {
    this.#notifications = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  /** 무슬롯 children(있다면)은 트리거 귀속 — 데이터는 프롭/JSON 슬롯이 담당 */
  protected override get defaultSlot(): "trigger" | "content" {
    return "trigger";
  }

  protected override render(): void {
    this.#readJson();
    super.render(); // Popover: 트리거 span + 패널 div 골격
    adoptStyles(notificationCenterStyles);
    this.#mountTrigger();
    this.#mountPanel();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdNotification[];
      if (Array.isArray(parsed)) this.#notifications = parsed;
    } catch {
      console.warn("[junds] <jd-notification-center> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #mountTrigger(): void {
    const trigger = this.triggerEl;
    if (!trigger) return;
    this.#bell = trigger.querySelector(".jd-notification-center__bell");
    if (this.#bell) {
      this.#badge = this.#bell.querySelector(".jd-notification-center__badge");
      return;
    }
    this.#bell = document.createElement("button");
    this.#bell.type = "button";
    this.#bell.className = "jd-notification-center__bell";
    this.#bell.innerHTML = BELL_SVG;
    this.#badge = document.createElement("span");
    this.#badge.className = "jd-notification-center__badge";
    this.#badge.setAttribute("aria-hidden", "true");
    this.#bell.append(this.#badge);
    trigger.append(this.#bell);
  }

  #mountPanel(): void {
    const panel = this.panelEl;
    if (!panel) return;
    this.#list = panel.querySelector(".jd-notification-center__list");
    if (this.#list) {
      this.#heading = panel.querySelector(".jd-notification-center__heading");
      this.#markAll = panel.querySelector(".jd-notification-center__mark-all");
      this.#clear = panel.querySelector(".jd-notification-center__clear");
      return;
    }
    const header = document.createElement("div");
    header.className = "jd-notification-center__header";

    this.#heading = document.createElement("span");
    this.#heading.className = "jd-notification-center__heading";
    this.#heading.id = jdUid("jd-nc-heading");
    panel.setAttribute("aria-labelledby", this.#heading.id);

    const actions = document.createElement("div");
    actions.className = "jd-notification-center__header-actions";
    this.#markAll = this.#mkHeaderBtn("jd-notification-center__mark-all");
    this.#clear = this.#mkHeaderBtn("jd-notification-center__clear");
    actions.append(this.#markAll, this.#clear);
    header.append(this.#heading, actions);

    this.#list = document.createElement("div");
    this.#list.className = "jd-notification-center__list";
    this.#list.setAttribute("role", "group");
    this.#list.setAttribute("aria-labelledby", this.#heading.id);

    panel.append(header, this.#list);
  }

  #mkHeaderBtn(className: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    return btn;
  }

  #onMarkAll = (): void => {
    this.emit("jd-mark-all-read");
  };
  #onClear = (): void => {
    this.emit("jd-clear");
  };

  /**
   * 헤더 버튼(모두 읽음·비우기) 리스너는 골격 1회 생성(render/#mountPanel)과 분리해
   * connected/disconnected 쌍으로 건다. render는 프리렌더 입양(§3.3)·재연결에서 다시
   * 실행되지 않으므로, 생성 시점에 리스너를 걸면 입양 골격의 버튼이 죽는다(헤드리스
   * 프리렌더 → 방문자 경로 §3.4). 목록 항목은 update의 재구축 경로(#syncList)가 매번
   * 다시 배선하므로 이 처리가 필요없다.
   */
  protected override connected(): void {
    super.connected();
    this.#markAll?.addEventListener("click", this.#onMarkAll);
    this.#clear?.addEventListener("click", this.#onClear);
  }

  protected override disconnected(): void {
    this.#markAll?.removeEventListener("click", this.#onMarkAll);
    this.#clear?.removeEventListener("click", this.#onClear);
    super.disconnected();
  }

  protected override update(): void {
    super.update(); // Popover: 패널 hidden/aria 동기화
    const unread = this.#notifications.reduce((n, item) => n + (item.read ? 0 : 1), 0);

    if (this.#bell) {
      this.#bell.setAttribute("aria-label", unread > 0 ? `알림, 안 읽음 ${unread}건` : "알림");
    }
    if (this.#badge) {
      this.#badge.hidden = unread === 0;
      this.#badge.textContent = unread > 99 ? "99+" : String(unread);
    }
    if (this.#heading) this.#heading.textContent = this.heading;
    if (this.#markAll) {
      this.#markAll.textContent = this.markAllLabel;
      this.#markAll.hidden = !this.markAllLabel || unread === 0;
    }
    if (this.#clear) {
      this.#clear.textContent = this.clearLabel;
      this.#clear.hidden = !this.clearLabel;
    }
    this.#syncList();
  }

  #syncList(): void {
    const list = this.#list;
    if (!list) return;
    if (this.#built === this.#notifications) {
      // 참조 동일 — 빈 문구만 최신화(다른 텍스트는 새 배열 대입 시 갱신, dropdown 선례)
      const empty = list.querySelector(".jd-notification-center__empty");
      if (empty) empty.textContent = this.emptyLabel;
      return;
    }
    this.#built = this.#notifications;
    list.textContent = "";
    if (this.#notifications.length === 0) {
      const empty = document.createElement("div");
      empty.className = "jd-notification-center__empty";
      empty.textContent = this.emptyLabel;
      list.append(empty);
      return;
    }
    const frag = document.createDocumentFragment();
    for (const n of this.#notifications) frag.append(this.#buildItem(n));
    list.append(frag);
  }

  #buildItem(n: JdNotification): HTMLElement {
    const clickable = typeof n.onClick === "function" || Boolean(n.id);
    const item = document.createElement(clickable ? "button" : "div");
    item.className = "jd-notification-center__item";
    if (item instanceof HTMLButtonElement) item.type = "button";
    if (!n.read) item.setAttribute("data-unread", "");

    if (n.icon !== undefined) {
      const icon = document.createElement("span");
      icon.className = "jd-notification-center__icon";
      icon.setAttribute("aria-hidden", "true");
      if (typeof n.icon === "string") {
        if (n.icon.trimStart().startsWith("<")) icon.innerHTML = n.icon;
        else icon.textContent = n.icon;
      } else {
        icon.append(n.icon);
      }
      item.append(icon);
    }

    const body = document.createElement("div");
    body.className = "jd-notification-center__body";
    const title = document.createElement("p");
    title.className = "jd-notification-center__title";
    title.textContent = n.title;
    body.append(title);
    if (n.description) {
      const desc = document.createElement("p");
      desc.className = "jd-notification-center__desc";
      desc.textContent = n.description;
      body.append(desc);
    }
    const time = document.createElement("p");
    time.className = "jd-notification-center__time";
    time.textContent = n.time;
    body.append(time);
    item.append(body);

    if (!n.read) {
      const dot = document.createElement("span");
      dot.className = "jd-notification-center__dot";
      dot.setAttribute("aria-hidden", "true");
      item.append(dot);
    }

    if (clickable) {
      item.addEventListener("click", () => {
        n.onClick?.();
        this.emit("jd-notification-click", { id: n.id });
      });
    }
    return item;
  }
}
