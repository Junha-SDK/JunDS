/**
 * <jd-book-cover> — 책 표지 (v2 composites/BookCover).
 *
 * 이 배치(책 시리즈 1)의 **표지 시각 정본**이다. <jd-book-card>는 표지를 다시 그리지
 * 않고 `size="fill"`로 이 태그를 안에 세운다(§6 R12 · jd-avatar-stack→jd-avatar 선례).
 * 자식에 값을 실을 때는 프로퍼티가 아니라 **attribute**를 쓴다 — 표지가 아직 업그레이드
 * 되지 않아도 값이 유실되지 않고, 프리렌더 스냅샷에 직렬화되어 입양(§3.3)이 성립한다.
 *
 * v2 대비 교정 4건:
 *  1. **이미지가 있는 표지는 이름이 없었다.** v2는 `<img alt="">`(장식)만 냈고 제목은
 *     이미지가 **없을 때만** 화면에 나왔다 — 커버 이미지를 준 순간 접근성 트리에서
 *     책 제목이 통째로 사라졌다. v3는 호스트가 role="img" + aria-label(제목 — 저자)이라
 *     두 경로 어느 쪽이든 같은 이름으로 읽힌다. 제목이 비면 이름을 붙이지 않는다
 *     (가짜 라벨 금지 — jd-avatar-stack 규칙 동형).
 *  2. **이미지가 깨지면 빈 상자만 남았다.** v2는 error 처리가 없어 대체 표시가 없었다.
 *     v3는 실패한 주소를 기억해 그라디언트 폴백으로 떨어지고 `jd-error`를 낸다.
 *  3. **`hue`가 Tailwind 클래스 문자열이었다**(`"from-purple-500 to-fuchsia-500"`).
 *     v3는 Tailwind를 쓰지 않으므로(§4.3) **CSS 값**을 받는다 — 그라디언트든 단색이든
 *     `--jd-book-cover-hue`로 들어간다. v2 문자열 표면은 react 어댑터가 번역할 몫이다.
 *  4. **spine 장식이 `<span>` DOM 1개였다.** 유지했다 — ::before/::after는 하단 광택이
 *     이미 쓰고 있고(::after), 책등은 effect에 따라 라운딩이 달라 의사요소 하나로는
 *     둘을 겸할 수 없다.
 *
 * 표면 주의: `title`은 HTMLElement 네이티브 프로퍼티와 이름이 겹친다(jd-action-sheet
 * 선례로 v2 프롭명을 지킨다). 프로토타입 접근자가 네이티브 쪽을 가리므로
 * `el.title = "…"`는 더 이상 호스트 attribute를 만들지 않고, HTML에 직접 쓴
 * `<jd-book-cover title="…">`만 브라우저 기본 툴팁을 띄운다(무해 — jd-book-card는
 * v2처럼 툴팁을 **의도적으로** 쓴다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on } from "../../behaviors/input.js";
import bookCoverStyles from "./book-cover.css.js";

const CLS = "jd-book-cover";

function el(doc: Document, tag: string, className: string): HTMLElement {
  const node = doc.createElement(tag);
  node.className = className;
  return node;
}

export class JdBookCover extends JdElement {
  static override tag = "jd-book-cover";
  static override props = {
    /** 표지 이미지 주소. 비거나 실패하면 그라디언트 폴백 */
    src: { type: String },
    /** 책 제목 — 폴백 캡션 + 접근 이름 */
    title: { type: String },
    /** 저자 — 폴백 캡션 + 접근 이름 보조 */
    author: { type: String },
    /** sm | md | lg | xl | fill — fill은 부모 상자를 채운다(jd-book-card 합성용) */
    size: { type: String, default: "md", reflect: true },
    /** flat | tilt | spine */
    effect: { type: String, default: "flat", reflect: true },
    /** 폴백 배경 CSS 값(그라디언트 또는 단색). v2 Tailwind 문자열이 아니다 */
    hue: { type: String },
  };

  declare src: string;
  declare title: string;
  declare author: string;
  declare size: string;
  declare effect: string;
  declare hue: string;

  #img!: HTMLImageElement;
  #fallback!: HTMLElement;
  #title!: HTMLElement;
  #author!: HTMLElement;
  /** 실패한 주소 — 같은 주소로 다시 시도해도 로드 이벤트가 오지 않는다 */
  #failed: string | null = null;

  protected render(): void {
    adoptStyles(bookCoverStyles);
    const found = this.querySelector<HTMLElement>(`:scope > .${CLS}__fallback`);
    const img = this.querySelector<HTMLImageElement>(`:scope > .${CLS}__img`);
    if (found && img) {
      // 입양(§3.3)
      this.#fallback = found;
      this.#title = found.querySelector<HTMLElement>(`.${CLS}__title`)!;
      this.#author = found.querySelector<HTMLElement>(`.${CLS}__author`)!;
      this.#img = img;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const doc = this.ownerDocument;
    this.#title = el(doc, "span", `${CLS}__title`);
    this.#author = el(doc, "span", `${CLS}__author`);
    this.#fallback = el(doc, "span", `${CLS}__fallback`);
    // 이름은 호스트(role="img")가 말한다 — 캡션은 같은 말을 두 번 하지 않는다
    this.#fallback.setAttribute("aria-hidden", "true");
    this.#fallback.append(this.#title, this.#author);

    this.#img = doc.createElement("img");
    this.#img.className = `${CLS}__img`;
    this.#img.alt = "";
    this.#img.setAttribute("aria-hidden", "true");
    this.#img.loading = "lazy";
    this.#img.decoding = "async";

    const spine = el(doc, "span", `${CLS}__spine`);
    spine.setAttribute("aria-hidden", "true");

    this.append(this.#fallback, this.#img, spine);
  }

  protected override connected(): void {
    this.own({ destroy: on(this.#img, "error", this.#onError) });
    this.own({ destroy: on(this.#img, "load", this.#onLoad) });
    // 캐시 히트 보정: 리스너가 붙기 전에 로드가 끝나 있을 수 있다
    const src = this.#img.getAttribute("src");
    if (src && this.#img.complete && this.#img.naturalWidth === 0) this.#fail(src);
  }

  #onError = (): void => {
    const src = this.#img.getAttribute("src");
    if (src) this.#fail(src);
  };

  #onLoad = (): void => {
    const src = this.#img.getAttribute("src");
    if (src) this.emit("jd-load", { src });
  };

  #fail(src: string): void {
    if (this.#failed === src) return;
    this.#failed = src;
    this.requestUpdate();
    this.emit("jd-error", { src });
  }

  protected override update(): void {
    const src = this.src;
    const usable = Boolean(src) && src !== this.#failed;
    if (usable) {
      if (this.#img.getAttribute("src") !== src) this.#img.src = src;
    } else if (this.#img.hasAttribute("src")) {
      this.#img.removeAttribute("src");
    }
    // 이미지 경로 여부는 CSS가 읽는다 — 폴백/이미지 중 하나만 그린다
    this.toggleAttribute("data-image", usable);

    this.#title.textContent = this.title;
    this.#title.hidden = !this.title;
    this.#author.textContent = this.author;
    this.#author.hidden = !this.author;

    if (this.hue) this.style.setProperty("--jd-book-cover-hue", this.hue);
    else this.style.removeProperty("--jd-book-cover-hue");

    // 이름 — 이미지가 있든 없든 같게 읽힌다(v2에는 이미지 경로의 이름이 없었다)
    if (this.title) {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", this.author ? `${this.title} — ${this.author}` : this.title);
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
    }
  }
}
