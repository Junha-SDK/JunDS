/**
 * <jd-detail-panel> — 오른쪽에서 밀려 나오는 **비모달** 상세 패널 (v2 composites/DetailPanel).
 *
 * **jd-modal을 상속하지 않는다** (오버레이 파생 규칙의 의도적 예외):
 * 이 패널은 백드롭이 없고 본문 스크롤을 잠그지 않으며 포커스도 가두지 않는다 — 표 옆에
 * 붙어서 "선택한 행의 상세"를 보여 주는 인스펙터이기 때문이다. 뒤쪽 목록을 계속 조작할 수
 * 있는 것이 이 컴포넌트의 존재 이유라, 모달 파생으로 감금·스크롤 락을 물려받으면 용도가
 * 깨진다. 대신 jd-modal의 **이벤트 계약**(jd-request-close cancelable → jd-open/jd-close)은
 * 그대로 따른다 — 소비자가 오버레이류를 같은 방식으로 다룰 수 있게.
 *
 * 탭도 <jd-tabs>를 내부에 심지 않는다. 이 레포의 컴포넌트 간 재사용은 전부 **상속**이고
 * (dropdown←popover, drawer←modal, result←empty-state …) 커스텀 엘리먼트를 다른 커스텀
 * 엘리먼트 안에 생성해 넣은 전례가 없다 — 정의 순서에 따라 업그레이드 전 프로퍼티 대입이
 * 접근자를 가리는 함정이 생긴다. 탭 스트립은 여기서 직접 만들되 키보드는 공용 Behavior
 * (createKeyHandler)로 처리한다.
 *
 * v2 결함 4건 교정:
 *  1. **닫힌 패널이 여전히 조작 가능했다.** `translate-x-full`로 화면 밖에 있을 뿐 DOM에
 *     그대로 있어서 Tab으로 닫힌 패널 안의 버튼에 들어갈 수 있었고 스크린리더도 읽었다.
 *     v3는 닫히면 inert + aria-hidden.
 *  2. **패널에 이름도 역할도 없었다.** v3는 제목이 있을 때 role=region + aria-labelledby로
 *     이름 있는 랜드마크가 된다(이름 없는 랜드마크는 걸지 않는다 — jd-announcement-bar 선례).
 *     complementary가 의미상 더 가깝지만 **다른 랜드마크 안에 있으면 안 된다**는 규칙이 있고
 *     이 패널은 <jd-app-shell>의 &lt;main&gt; 안에 놓이는 것이 자연스럽다 — region은 그 제약이 없다.
 *  3. **탭에 키보드가 없었다.** role="tab"만 있고 화살표 키·로빙 tabindex·tabpanel 연결이
 *     전무했다(jd-tabs가 고친 것과 같은 결함). v3는 ←/→·Home/End + 자동 활성화 +
 *     `data-tab="<key>"` 자식을 tabpanel로 결선한다.
 *  4. **포커스가 아무 데도 가지 않았다.** 열면 패널로 포커스를 옮기고, 닫을 때 포커스가
 *     패널 안에 있었다면 열기 전 요소로 되돌린다.
 *
 * 그 밖에 `max-width: 100vw`를 걸어 420px 패널이 모바일 뷰포트를 넘지 않게 했다.
 */
import { JdElement } from "../../core/element.js";
import {
  syncAriaIdRefs,
  syncOwnedAttribute,
} from "../../core/aria.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createKeyHandler } from "../../behaviors/input.js";
import detailPanelStyles from "./detail-panel.css.js";

export interface JdDetailPanelTab {
  /** 선택 식별자 — activeTab·jd-change detail과 대응 */
  key: string;
  label: string;
  /** 0보다 크면 라벨 옆 카운트 배지 (v2 동형) */
  badge?: number;
}

/** v2 statusStyles의 라벨 — 상태는 색이 아니라 이 텍스트가 전달한다 */
const STATUS_LABEL: Record<string, string> = {
  success: "성공",
  warning: "경고",
  danger: "위험",
  info: "정보",
};

const CLOSE_SVG =
  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">` +
  `<path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdDetailPanel extends JdElement {
  static override tag = "jd-detail-panel";
  static override props = {
    open: { type: Boolean, reflect: true },
    title: { type: String },
    subtitle: { type: String },
    /** success | warning | danger | info. 빈 값이면 배지 없음 */
    status: { type: String, reflect: true },
    /** 패널 너비(px). v2 기본 420 */
    width: { type: Number, default: 420 },
    /** 선택된 탭의 key. 비어 있고 탭이 있으면 첫 탭이 선택된다(v2 동형) */
    activeTab: { type: String, reflect: true },
  };

  declare open: boolean;
  declare title: string;
  declare subtitle: string;
  declare status: string;
  declare width: number;
  declare activeTab: string;

  #titleEl!: HTMLHeadingElement;
  #subtitleEl!: HTMLParagraphElement;
  #statusEl!: HTMLSpanElement;
  #tablist!: HTMLDivElement;
  #body!: HTMLDivElement;

  #tabs: JdDetailPanelTab[] = [];
  #builtTabs: readonly JdDetailPanelTab[] | null = null;
  #wasOpen = false;
  #returnFocus: HTMLElement | null = null;

  get tabs(): JdDetailPanelTab[] {
    return this.#tabs;
  }
  set tabs(v: JdDetailPanelTab[]) {
    this.#tabs = Array.isArray(v) ? v : [];
    this.#builtTabs = null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(detailPanelStyles);
    this.#readJson(); // children을 옮기기 전에 소비한다
    const header = this.querySelector<HTMLElement>(":scope > .jd-detail-panel__header");
    if (header) this.#adopt(header);
    else this.#build();

    if (!this.hasAttribute("tabindex")) this.tabIndex = -1;
    if (!this.#titleEl.id) this.#titleEl.id = jdUid("jd-detail-panel-title");

    this.#wasOpen = this.open; // 최초 렌더는 전이가 아니다 — 포커스·이벤트 없음
    this.#syncHidden();
    this.#syncTabs();
    this.update();
  }

  protected override connected(): void {
    this.#tablist.addEventListener("click", this.#onTabClick);
    this.own(
      createKeyHandler(this.#tablist, {
        arrowright: () => this.#step(1),
        arrowleft: () => this.#step(-1),
        home: () => this.#selectAt(0),
        end: () => this.#selectAt(this.#tabs.length - 1),
      }),
    );
    // ESC는 v2와 같이 문서 레벨이다(패널에 포커스가 없어도 닫힌다).
    // 다만 위에 뜬 오버레이가 이미 처리한 ESC는 건드리지 않는다.
    this.own(
      createKeyHandler(
        this.ownerDocument,
        {
          escape: (e) => {
            if (e.defaultPrevented) return;
            this.#requestClose("escape");
          },
        },
        { preventDefault: false, enableOnFormTags: true },
      ),
    );
  }

  protected override disconnected(): void {
    this.#tablist.removeEventListener("click", this.#onTabClick);
  }

  /** 열기 */
  show(): void {
    this.open = true;
  }

  /** 닫기 요청 — jd-request-close가 preventDefault되지 않으면 닫힌다 (jd-modal 계약) */
  close(): void {
    this.#requestClose("close");
  }

  protected override update(): void {
    if (this.#builtTabs !== this.#tabs) this.#syncTabs();

    this.#titleEl.textContent = this.title;
    // 이름이 있을 때만 랜드마크가 된다 (jd-announcement-bar 선례)
    if (this.title) {
      syncOwnedAttribute(this, "role", "region", { preserveExisting: true });
      syncAriaIdRefs(this, "aria-labelledby", this.#titleEl.id);
    } else {
      syncOwnedAttribute(this, "role", null);
      syncAriaIdRefs(this, "aria-labelledby", null);
    }

    this.#subtitleEl.textContent = this.subtitle;
    this.#subtitleEl.hidden = !this.subtitle;

    const label = STATUS_LABEL[this.status];
    this.#statusEl.textContent = label ?? "";
    this.#statusEl.hidden = !label;

    this.style.setProperty("--jd-detail-panel-width", `${this.width > 0 ? this.width : 420}px`);

    this.#syncTabState();

    if (this.open !== this.#wasOpen) this.#applyOpenChange(this.open);
  }

  /* ── 골격 ─────────────────────────────────────────────────────────── */

  #adopt(header: HTMLElement): void {
    this.#titleEl = header.querySelector(".jd-detail-panel__title")!;
    this.#subtitleEl = header.querySelector(".jd-detail-panel__subtitle")!;
    this.#statusEl = header.querySelector(".jd-detail-panel__status")!;
    this.#tablist = this.querySelector(":scope > .jd-detail-panel__tabs")!;
    this.#body = this.querySelector(":scope > .jd-detail-panel__body")!;
    header
      .querySelector(".jd-detail-panel__close")
      ?.addEventListener("click", this.#onCloseClick);
  }

  #build(): void {
    const doc = this.ownerDocument;
    const kids = [...this.childNodes];

    const header = doc.createElement("header");
    header.className = "jd-detail-panel__header";

    const heading = doc.createElement("div");
    heading.className = "jd-detail-panel__heading";
    const row = doc.createElement("div");
    row.className = "jd-detail-panel__title-row";
    this.#titleEl = doc.createElement("h2");
    this.#titleEl.className = "jd-detail-panel__title";
    this.#statusEl = doc.createElement("span");
    this.#statusEl.className = "jd-detail-panel__status";
    row.append(this.#titleEl, this.#statusEl);
    this.#subtitleEl = doc.createElement("p");
    this.#subtitleEl.className = "jd-detail-panel__subtitle";
    heading.append(row, this.#subtitleEl);

    const close = doc.createElement("button");
    close.type = "button";
    close.className = "jd-detail-panel__close";
    close.setAttribute("aria-label", "닫기");
    close.innerHTML = CLOSE_SVG;
    close.addEventListener("click", this.#onCloseClick);
    header.append(heading, close);

    this.#tablist = doc.createElement("div");
    this.#tablist.className = "jd-detail-panel__tabs";
    this.#tablist.setAttribute("role", "tablist");
    this.#tablist.setAttribute("aria-orientation", "horizontal");

    this.#body = doc.createElement("div");
    this.#body.className = "jd-detail-panel__body";
    this.#body.append(...kids); // children은 본문으로 이동

    this.append(header, this.#tablist, this.#body);
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (radio-group·action-sheet·tabs 선례) */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdDetailPanelTab[];
      if (Array.isArray(parsed)) this.#tabs = parsed;
    } catch {
      console.warn("[junds] <jd-detail-panel> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /* ── 탭 ──────────────────────────────────────────────────────────── */

  #buttons(): HTMLButtonElement[] {
    return Array.from(
      this.#tablist.querySelectorAll<HTMLButtonElement>(":scope > button.jd-detail-panel__tab"),
    );
  }

  /** 입양(§3.3): 개수가 같으면 만들지 않고 내용만 맞춘다 */
  #syncTabs(): void {
    this.#builtTabs = this.#tabs;
    let btns = this.#buttons();
    if (btns.length !== this.#tabs.length) {
      for (const b of btns) b.remove();
      for (let i = 0; i < this.#tabs.length; i++) this.#tablist.append(this.#createTab());
      btns = this.#buttons();
    }
    btns.forEach((btn, i) => {
      const tab = this.#tabs[i];
      if (!tab) return;
      if (!btn.id) btn.id = jdUid("jd-detail-panel-tab");
      btn.dataset.key = tab.key;
      btn.querySelector<HTMLElement>(".jd-detail-panel__tab-label")!.textContent = tab.label;
      const badge = btn.querySelector<HTMLElement>(".jd-detail-panel__tab-badge")!;
      const show = typeof tab.badge === "number" && tab.badge > 0; // v2 동형
      badge.textContent = show ? String(tab.badge) : "";
      badge.hidden = !show;
    });
    this.#tablist.hidden = this.#tabs.length === 0;
  }

  #createTab(): HTMLButtonElement {
    const doc = this.ownerDocument;
    const btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "jd-detail-panel__tab";
    btn.setAttribute("role", "tab");
    const label = doc.createElement("span");
    label.className = "jd-detail-panel__tab-label";
    const badge = doc.createElement("span");
    badge.className = "jd-detail-panel__tab-badge";
    btn.append(label, badge);
    return btn;
  }

  #activeIndex(): number {
    if (this.#tabs.length === 0) return -1;
    const i = this.#tabs.findIndex((t) => t.key === this.activeTab);
    return i >= 0 ? i : 0; // v2: 선택이 없으면 첫 탭
  }

  #syncTabState(): void {
    const index = this.#activeIndex();
    const active = index >= 0 ? this.#tabs[index] : undefined;
    // activeTab을 실제 표시 상태와 일치시킨다 (v2는 내부 state라 프롭이 거짓말을 했다)
    if (active && this.activeTab !== active.key) {
      this.activeTab = active.key; // → requestUpdate, 다음 회차에서 수렴
      return;
    }
    const btns = this.#buttons();
    btns.forEach((btn, i) => {
      btn.setAttribute("aria-selected", String(i === index));
      btn.tabIndex = i === index ? 0 : -1;
      const panel = this.#panelFor(this.#tabs[i]?.key);
      if (!panel) {
        btn.removeAttribute("aria-controls");
        return;
      }
      if (!panel.id) panel.id = jdUid("jd-detail-panel-panel");
      btn.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", btn.id);
      if (!panel.hasAttribute("tabindex")) panel.tabIndex = 0;
      panel.hidden = i !== index;
    });
    // 탭이 없으면 본문 자체가 스크롤 영역이다 — 키보드로 스크롤할 수 있어야 한다
    if (this.#tabs.length === 0) this.#body.tabIndex = 0;
    else this.#body.removeAttribute("tabindex");
  }

  /** 본문 직계 자식 중 `data-tab="<key>"`가 그 탭의 패널이다 */
  #panelFor(key: string | undefined): HTMLElement | null {
    if (!key) return null;
    for (const el of this.#body.children) {
      if (el instanceof HTMLElement && el.dataset.tab === key) return el;
    }
    return null;
  }

  /** 현재 포커스(없으면 선택) 위치에서 delta칸 — 순환 (APG Tabs) */
  #step(delta: 1 | -1): void {
    const n = this.#tabs.length;
    if (n === 0) return;
    const btns = this.#buttons();
    const focused = (this.ownerDocument.activeElement as Element | null)?.closest<HTMLButtonElement>(
      "button.jd-detail-panel__tab",
    );
    const from = focused ? btns.indexOf(focused) : this.#activeIndex();
    this.#selectAt((((from + delta) % n) + n) % n);
  }

  /** 자동 활성화(APG 기본): 포커스 이동이 곧 선택 */
  #selectAt(index: number): void {
    const tab = index >= 0 ? this.#tabs[index] : undefined;
    if (!tab) return;
    this.#commit(tab.key);
    // update()의 마이크로태스크를 기다리지 않는다 — tabindex -1인 채로 포커스를 주면
    // 이후 Tab 키 순서가 어긋난다 (jd-tabs 선례)
    const btns = this.#buttons();
    btns.forEach((btn, i) => {
      btn.tabIndex = i === index ? 0 : -1;
    });
    btns[index]?.focus();
  }

  #commit(key: string): void {
    if (this.activeTab === key) return;
    this.activeTab = key;
    this.emit("jd-change", { value: key });
  }

  #onTabClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest<HTMLButtonElement>(
      "button.jd-detail-panel__tab",
    );
    if (!btn || btn.parentElement !== this.#tablist) return;
    const key = btn.dataset.key;
    if (key) this.#commit(key);
  };

  #onCloseClick = (): void => {
    this.close();
  };

  /* ── 열림 상태 ────────────────────────────────────────────────────── */

  #requestClose(reason: "escape" | "close"): void {
    if (!this.open) return;
    const proceed = this.emit("jd-request-close", { reason }, { cancelable: true });
    if (proceed) this.open = false; // → update()가 전이 부수효과 수행
  }

  /** 닫힌 패널은 화면 밖에 있을 뿐이다 — 포커스·AT에서도 빼야 실제로 닫힌 것이다 */
  #syncHidden(): void {
    this.toggleAttribute("inert", !this.open);
    if (this.open) this.removeAttribute("aria-hidden");
    else this.setAttribute("aria-hidden", "true");
  }

  #applyOpenChange(open: boolean): void {
    this.#wasOpen = open;
    const doc = this.ownerDocument;
    const active = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
    if (open) {
      this.#returnFocus = active && !this.contains(active) ? active : null;
      this.#syncHidden();
      this.focus({ preventScroll: true });
      this.emit("jd-open");
    } else {
      const wasInside = active !== null && this.contains(active);
      this.#syncHidden(); // inert가 붙으면서 내부 포커스는 어차피 풀린다
      if (wasInside) this.#returnFocus?.focus({ preventScroll: true });
      this.#returnFocus = null;
      this.emit("jd-close");
    }
  }
}
