/**
 * <jd-app-header> — 앱 상단 헤더 셸 (v2 finance/AppHeader).
 *
 * v2는 Logo·날짜시각·우측 액션(ThemeToggle/AlertHeaderButton/…)·검색행(SearchBox +
 * 메뉴)을 한 컴포넌트에 하드코딩했다. 그 자식들은 각기 별개 컴포넌트라 DS 셸이 특정
 * 구현을 박아 넣으면 안 된다 — v3는 **구조(스티키·블러 바 + 4개 영역)만** 제공하고
 * 브랜드/액션/검색 콘텐츠는 light DOM 슬롯으로 받는다(app-shell·profile-header 슬롯
 * 규약 동형):
 *   slot="brand"(또는 무슬롯) · slot="actions" · slot="search", 날짜/시각은 `timestamp`.
 *
 * v2 대비: 정적 구조라 HStack 래퍼가 필요 없고, sticky·검색행 노출을 속성으로 토글한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import appHeaderStyles from "./app-header.css.js";

export class JdAppHeader extends JdElement {
  static override tag = "jd-app-header";
  static override props = {
    /** 중앙 메타 텍스트(날짜·시각 등, 소비자가 포매팅) */
    timestamp: { type: String },
    /** 검색행 숨김 — 기본은 노출(콘텐츠가 있을 때만 실제로 보인다) */
    noSearch: { type: Boolean, reflect: true },
    /** 상단 고정 해제 — 기본은 sticky */
    static: { type: Boolean, reflect: true },
  };

  declare timestamp: string;
  declare noSearch: boolean;
  declare static: boolean;

  #meta!: HTMLElement;
  #search!: HTMLElement;

  protected render(): void {
    adoptStyles(appHeaderStyles);
    const existing = this.querySelector<HTMLElement>(":scope > header.jd-app-header");
    if (existing) {
      this.#meta = existing.querySelector(".jd-app-header__meta")!;
      this.#search = existing.querySelector(".jd-app-header__search")!;
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
    const brandNodes = [...this.childNodes].filter(
      (n) => !(n instanceof Element) || !["actions", "search"].includes(n.getAttribute("slot") ?? ""),
    );
    const actionNodes = pick("actions");
    const searchNodes = pick("search");

    const header = document.createElement("header");
    header.className = "jd-app-header";

    const bar = document.createElement("div");
    bar.className = "jd-app-header__bar";

    const brand = document.createElement("div");
    brand.className = "jd-app-header__brand";
    brand.append(...brandNodes);

    this.#meta = document.createElement("span");
    this.#meta.className = "jd-app-header__meta";

    const actions = document.createElement("div");
    actions.className = "jd-app-header__actions";
    actions.append(...actionNodes);

    bar.append(brand, this.#meta, actions);

    this.#search = document.createElement("div");
    this.#search.className = "jd-app-header__search";
    this.#search.append(...searchNodes);

    header.append(bar, this.#search);
    this.append(header);
  }

  protected override update(): void {
    const hasMeta = Boolean(this.timestamp);
    this.#meta.textContent = hasMeta ? this.timestamp : "";
    this.#meta.hidden = !hasMeta;
    this.#search.hidden = this.noSearch || this.#search.childElementCount === 0;
  }
}
