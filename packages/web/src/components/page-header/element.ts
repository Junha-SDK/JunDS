/**
 * <jd-page-header-bar> — 표준 페이지 헤더 (v2 composites/PageHeader).
 *
 * breadcrumb + title/description + (뒤로가기·아바타·액션·푸터). 스칼라(title·
 * description)는 attribute, 리치 콘텐츠는 슬롯으로 받는다:
 *   [slot="avatar"] · [slot="actions"] · [slot="footer"].
 * breadcrumb는 복합 데이터라 `breadcrumb` 프로퍼티(Array) 또는 자식
 * `<script type="application/json">` 슬롯으로 받는다(§1.3, RadioGroup 선례).
 *
 * v2 대비 교정 2건:
 *  1. **빵부스러기가 목록이 아니었다.** v2는 `<nav>` 안에 `<span>`을 나열했다 —
 *     jd-breadcrumb와 같은 결함이라 같은 해법으로 `<ol>/<li>` + 마지막 항목
 *     `aria-current="page"`로 낸다(구분자는 `aria-hidden`).
 *  2. **divider 기본값 뒤집기.** v2 boolean 프롭 `divider=true`는 CE attribute로는
 *     끌 수 없다(존재=참). follow-button `noUnfollowHover`와 같은 opt-out 관용구로
 *     `no-divider`를 둔다(기본은 구분선 표시).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import pageHeaderStyles from "./page-header.css.js";

export interface JdPageHeaderCrumb {
  label: string;
  /** 링크 주소 — 없거나 마지막 항목이면 텍스트(현재 위치)로 렌더된다 */
  href?: string;
}

/** v2 뒤로가기 셰브론 — 16×16 */
const BACK_SVG =
  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdPageHeaderBar extends JdElement {
  static override tag = "jd-page-header-bar";
  static override props = {
    /** 메인 제목 */
    title: { type: String },
    /** 부제 / 설명 */
    description: { type: String },
    /** 좌측 뒤로가기 버튼 노출 — 클릭 시 jd-back 발행(v2 onBack) */
    back: { type: Boolean, reflect: true },
    /** 구분선 감추기 (v2 divider=true의 opt-out) */
    noDivider: { type: Boolean, reflect: true },
    // breadcrumb(배열)은 property 전용(§1.3)
  };

  declare title: string;
  declare description: string;
  declare back: boolean;
  declare noDivider: boolean;

  #crumbs: JdPageHeaderCrumb[] = [];
  #builtCrumbs: readonly JdPageHeaderCrumb[] | null = null;

  #header!: HTMLElement;
  #nav!: HTMLElement;
  #crumbList!: HTMLOListElement;
  #backBtn!: HTMLButtonElement;
  #avatar!: HTMLElement;
  #heading!: HTMLElement;
  #title!: HTMLHeadingElement;
  #desc!: HTMLParagraphElement;
  #actions!: HTMLElement;
  #footer!: HTMLElement;

  get breadcrumb(): JdPageHeaderCrumb[] {
    return this.#crumbs;
  }
  set breadcrumb(v: JdPageHeaderCrumb[]) {
    this.#crumbs = Array.isArray(v) ? v : [];
    this.#builtCrumbs = null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(pageHeaderStyles);
    this.#readJson();
    const existing = this.querySelector<HTMLElement>(":scope > header.jd-page-header-bar");
    if (existing) this.#adopt(existing);
    else this.#build();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdPageHeaderCrumb[];
      if (Array.isArray(parsed)) this.#crumbs = parsed;
    } catch {
      console.warn("[junds] <jd-page-header-bar> breadcrumb JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #adopt(header: HTMLElement): void {
    this.#header = header;
    this.#nav = header.querySelector(".jd-page-header-bar__breadcrumb")!;
    this.#crumbList = header.querySelector(".jd-page-header-bar__crumbs")!;
    this.#backBtn = header.querySelector(".jd-page-header-bar__back")!;
    this.#avatar = header.querySelector(".jd-page-header-bar__avatar")!;
    this.#heading = header.querySelector(".jd-page-header-bar__heading")!;
    this.#title = header.querySelector(".jd-page-header-bar__title")!;
    this.#desc = header.querySelector(".jd-page-header-bar__description")!;
    this.#actions = header.querySelector(".jd-page-header-bar__actions")!;
    this.#footer = header.querySelector(".jd-page-header-bar__footer")!;
  }

  #build(): void {
    // children 분류(§1.3): script는 이미 소비됨. slot으로 리치 영역 배치.
    const avatarNodes: Node[] = [];
    const actionNodes: Node[] = [];
    const footerNodes: Node[] = [];
    const leftover: Node[] = [];
    for (const node of Array.from(this.childNodes)) {
      const slot = node.nodeType === 1 ? (node as Element).getAttribute("slot") : null;
      if (slot === "avatar") avatarNodes.push(node);
      else if (slot === "actions") actionNodes.push(node);
      else if (slot === "footer") footerNodes.push(node);
      else leftover.push(node);
    }

    this.#header = document.createElement("header");
    this.#header.className = "jd-page-header-bar";

    // breadcrumb
    this.#nav = document.createElement("nav");
    this.#nav.className = "jd-page-header-bar__breadcrumb";
    this.#nav.setAttribute("aria-label", "breadcrumb");
    this.#crumbList = document.createElement("ol");
    this.#crumbList.className = "jd-page-header-bar__crumbs";
    this.#nav.append(this.#crumbList);

    // 본문 행 (뒤로가기 · 아바타 · 제목 · 액션)
    const main = document.createElement("div");
    main.className = "jd-page-header-bar__main";

    this.#backBtn = document.createElement("button");
    this.#backBtn.type = "button";
    this.#backBtn.className = "jd-page-header-bar__back";
    this.#backBtn.setAttribute("aria-label", "뒤로 가기");
    this.#backBtn.innerHTML = BACK_SVG;

    this.#avatar = document.createElement("div");
    this.#avatar.className = "jd-page-header-bar__avatar";
    this.#avatar.append(...avatarNodes);

    this.#heading = document.createElement("div");
    this.#heading.className = "jd-page-header-bar__heading";
    this.#title = document.createElement("h1");
    this.#title.className = "jd-page-header-bar__title";
    this.#desc = document.createElement("p");
    this.#desc.className = "jd-page-header-bar__description";
    this.#heading.append(this.#title, this.#desc);

    this.#actions = document.createElement("div");
    this.#actions.className = "jd-page-header-bar__actions";
    this.#actions.append(...actionNodes);

    main.append(this.#backBtn, this.#avatar, this.#heading, this.#actions);

    this.#footer = document.createElement("div");
    this.#footer.className = "jd-page-header-bar__footer";
    this.#footer.append(...footerNodes);

    this.#header.append(this.#nav, main, this.#footer);
    this.append(this.#header);
    // slot 없는 잔여 노드는 버린다 — 헤더는 정해진 영역만 노출한다
    for (const node of leftover) (node as ChildNode).remove?.();
  }

  protected override connected(): void {
    this.#backBtn.addEventListener("click", this.#onBack);
  }

  protected override disconnected(): void {
    this.#backBtn?.removeEventListener("click", this.#onBack);
  }

  #onBack = (): void => {
    this.emit("jd-back");
  };

  protected override update(): void {
    // divider (opt-out)
    this.#header.toggleAttribute("data-divider", !this.noDivider);

    // breadcrumb
    if (this.#builtCrumbs !== this.#crumbs) this.#syncCrumbs();

    // 뒤로가기
    this.#backBtn.hidden = !this.back;

    // 아바타 — 슬롯이 비면 접는다
    this.#avatar.hidden = this.#avatar.childNodes.length === 0;

    // 제목 / 설명
    this.#title.textContent = this.title ?? "";
    this.#title.hidden = !this.title;
    const hasDesc = Boolean(this.description);
    this.#desc.textContent = this.description ?? "";
    this.#desc.hidden = !hasDesc;

    // 액션 / 푸터 — 슬롯이 비면 접는다
    this.#actions.hidden = this.#actions.childNodes.length === 0;
    this.#footer.hidden = this.#footer.childNodes.length === 0;
  }

  #syncCrumbs(): void {
    this.#builtCrumbs = this.#crumbs;
    const list = this.#crumbList;
    const items = this.#crumbs;
    this.#nav.hidden = items.length === 0;

    const rows = Array.from(list.children) as HTMLLIElement[];
    // 링크/텍스트 전환이 있으면 골격 재생성, 그 외에는 입양(§3.3)
    const shapeChanged =
      rows.length !== items.length ||
      items.some((item, i) => {
        const content = rows[i]?.querySelector(".jd-page-header-bar__crumb-content");
        return content?.tagName !== (this.#isLink(item, i) ? "A" : "SPAN");
      });
    if (shapeChanged) {
      list.textContent = "";
      items.forEach((item, i) => list.append(this.#createCrumb(item, i)));
    }
    Array.from(list.children).forEach((node, i) => {
      const item = items[i];
      if (!item) return;
      const row = node as HTMLLIElement;
      const content = row.querySelector<HTMLElement>(".jd-page-header-bar__crumb-content")!;
      content.textContent = item.label;
      if (content instanceof HTMLAnchorElement) content.href = item.href ?? "";
      const last = i === items.length - 1;
      if (last) content.setAttribute("aria-current", "page");
      else content.removeAttribute("aria-current");
    });
  }

  /** 링크로 렌더되는가 — 마지막(현재 위치)은 항상 텍스트 */
  #isLink(item: JdPageHeaderCrumb, index: number): boolean {
    return Boolean(item.href) && index < this.#crumbs.length - 1;
  }

  #createCrumb(item: JdPageHeaderCrumb, index: number): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "jd-page-header-bar__crumb";
    const content = document.createElement(this.#isLink(item, index) ? "a" : "span");
    content.className = "jd-page-header-bar__crumb-content";
    row.append(content);
    if (index < this.#crumbs.length - 1) {
      const sep = document.createElement("span");
      sep.className = "jd-page-header-bar__sep";
      sep.setAttribute("aria-hidden", "true");
      sep.textContent = "/";
      row.append(sep);
    }
    return row;
  }
}
