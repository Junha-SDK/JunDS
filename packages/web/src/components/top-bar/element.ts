/**
 * <jd-top-bar> — 검색 우선 단일 행 상단 바 (v2 finance/TopBar).
 *
 * v2 TopBar는 검색을 주 영역으로 두고 브랜드(모바일 로고)·KST 시계·시장 상태 알약·
 * 우측 액션(테마 토글/알림/관리/로그아웃)을 한 줄에 담았으며, 인증(/api/auth/me)·라우터·
 * 매초 시계를 직접 물고 있었다. DS 컴포넌트는 그 앱 결합을 전부 걷어내고 **구조만**
 * 제공한다 — 브랜드·검색·액션은 light DOM 슬롯, 시각은 `timestamp`(소비자 포매팅,
 * 프리렌더 결정성 유지), 시장 상태는 `status`/`status-label`.
 *
 * jd-app-header와의 관계: app-header는 2행(바 + 검색행) 범용 셸, top-bar는 1행 검색 우선
 * 변형 + 시장 상태 알약이다 — 골격이 달라 extends 파생이 아니라 형제로 두되, sticky·블러·
 * 슬롯(brand/search/actions) 관용구는 app-header와 맞춘다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import topBarStyles from "./top-bar.css.js";

export class JdTopBar extends JdElement {
  static override tag = "jd-top-bar";
  static override props = {
    /** 중앙 메타 텍스트(날짜·시각 등, 소비자가 포매팅) */
    timestamp: { type: String },
    /** 시장 상태 키 — "open"이면 상태 알약이 활성(맥동 점), 그 외는 muted */
    status: { type: String, reflect: true },
    /** 상태 알약 라벨(예: "장중" / "휴장") — 없으면 알약 숨김 */
    statusLabel: { type: String },
    /**
     * 상단 고정 해제 — 기본(속성 없음)은 sticky, `static`이 있으면 정적 배치.
     * Boolean attribute는 "존재=true"라 default:true가 성립하지 않는다(속성을 뗄 방법이
     * 없고 CSS `[sticky]`도 매칭 안 됨) → sticky를 반전한 opt-out 속성으로 둔다.
     */
    static: { type: Boolean, reflect: true },
  };

  declare timestamp: string;
  declare status: string;
  declare statusLabel: string;
  declare static: boolean;

  #brand!: HTMLElement;
  #search!: HTMLElement;
  #meta!: HTMLElement;
  #time!: HTMLElement;
  #status!: HTMLElement;
  #statusText!: HTMLElement;

  protected render(): void {
    adoptStyles(topBarStyles);
    const existing = this.querySelector<HTMLElement>(":scope > header.jd-top-bar");
    if (existing) {
      this.#brand = existing.querySelector(".jd-top-bar__brand")!;
      this.#search = existing.querySelector(".jd-top-bar__search")!;
      this.#meta = existing.querySelector(".jd-top-bar__meta")!;
      this.#time = existing.querySelector(".jd-top-bar__timestamp")!;
      this.#status = existing.querySelector(".jd-top-bar__status")!;
      this.#statusText = existing.querySelector(".jd-top-bar__status-text")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const pick = (name: string): Node[] =>
      [...this.childNodes].filter((n) => n instanceof Element && n.getAttribute("slot") === name);
    // 무슬롯(또는 slot="brand")은 브랜드
    const brandNodes = [...this.childNodes].filter(
      (n) =>
        !(n instanceof Element) || !["search", "actions"].includes(n.getAttribute("slot") ?? ""),
    );
    const searchNodes = pick("search");
    const actionNodes = pick("actions");

    const header = document.createElement("header");
    header.className = "jd-top-bar";
    const inner = document.createElement("div");
    inner.className = "jd-top-bar__inner";

    this.#brand = document.createElement("div");
    this.#brand.className = "jd-top-bar__brand";
    this.#brand.append(...brandNodes);

    this.#search = document.createElement("div");
    this.#search.className = "jd-top-bar__search";
    this.#search.append(...searchNodes);

    this.#meta = document.createElement("div");
    this.#meta.className = "jd-top-bar__meta";
    this.#time = document.createElement("span");
    this.#time.className = "jd-top-bar__timestamp";
    this.#status = document.createElement("span");
    this.#status.className = "jd-top-bar__status";
    const dot = document.createElement("span");
    dot.className = "jd-top-bar__status-dot";
    dot.setAttribute("aria-hidden", "true");
    this.#statusText = document.createElement("span");
    this.#statusText.className = "jd-top-bar__status-text";
    this.#status.append(dot, this.#statusText);
    this.#meta.append(this.#time, this.#status);

    const actions = document.createElement("div");
    actions.className = "jd-top-bar__actions";
    actions.append(...actionNodes);

    inner.append(this.#brand, this.#search, this.#meta, actions);
    header.append(inner);
    this.append(header);
  }

  protected override update(): void {
    this.#brand.hidden = this.#brand.childElementCount === 0;
    this.#search.hidden = this.#search.childElementCount === 0;

    const hasTime = Boolean(this.timestamp);
    this.#time.textContent = hasTime ? this.timestamp : "";
    this.#time.hidden = !hasTime;

    const hasStatus = Boolean(this.statusLabel);
    this.#statusText.textContent = hasStatus ? this.statusLabel : "";
    this.#status.hidden = !hasStatus;
    this.#status.setAttribute("data-status", this.status || "");

    this.#meta.hidden = !hasTime && !hasStatus;
  }
}
