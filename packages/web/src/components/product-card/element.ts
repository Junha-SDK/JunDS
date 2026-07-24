/**
 * <jd-product-card> — e-commerce 상품 카드 (v2 composites/ProductCard).
 *   이미지 + 브랜드 + 제목 + 평점 + 가격 + 위시리스트 + 장바구니.
 *
 * v2 대비 구조 교정(핵심):
 *   v2는 카드 전체를 `<div onClick>`으로 만들고 그 안에 위시·장바구니 `<button>`을 중첩한 뒤
 *   `stopPropagation`으로 분리했다 — 중첩 인터랙티브(버튼 in 클릭 div)이고 키보드로 카드
 *   본체에 도달할 수 없었다. v3는 **오버레이 링크 패턴**으로 바꾼다:
 *     · 카드 본문은 비인터랙티브 컨테이너(.jd-product-card__main).
 *     · 이동 액션은 카드 전면을 덮는 형제 `<a href>`(또는 `<button>`) 1개(.jd-product-card__link).
 *       접근 이름은 제목을 aria-labelledby로 참조 → WCAG 2.5.3(Label in Name) 충족.
 *     · 위시·장바구니 버튼은 링크보다 위 z-index의 **형제**라 중첩이 사라진다.
 *   → href를 주면 진짜 링크(우클릭·새 탭·미들클릭 공짜), interactive면 jd-select 발행,
 *     둘 다 없으면 정적 카드(v2의 onClick 없는 div 등가).
 *
 * 이벤트(§1.5):
 *   · 링크가 <a>면 네이티브 이동이 그대로 동작(jd-* 재발명 없음).
 *   · 링크가 <button>이면 `jd-select`(detail 없음) — v2 onClick 대체.
 *   · 위시 토글 → `jd-wishlist` { wishlisted } (변경될 상태). 비제어 — 서버 실패 시 소비자가 되돌린다.
 *   · 장바구니 → `jd-add`.
 *
 * 프롭 표면: 버튼 노출은 v2의 콜백 존재(onWishlist/onAddToCart)를 Boolean 속성으로 옮겼다
 *   (`wishlistable`, `add-to-cart`). 가격은 리치 콘텐츠가 흔해 `[slot="price"]` 자식(예:
 *   <jd-price-display>)을 우선 수용하고, 없으면 `price` 문자열을 쓴다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import productCardStyles from "./product-card.css.js";

const CLS = "jd-product-card";
const NS = "http://www.w3.org/2000/svg";
const HEART_PATH =
  "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";

function span(doc: Document, className: string): HTMLElement {
  const n = doc.createElement("span");
  n.className = className;
  return n;
}

export class JdProductCard extends JdElement {
  static override tag = "jd-product-card";
  static override props = {
    title: { type: String },
    image: { type: String },
    imageRatio: { type: String, default: "1/1" }, // attr: image-ratio
    /** 단순 가격 텍스트 — [slot="price"] 자식이 있으면 그쪽이 이긴다 */
    price: { type: String },
    /** 평점 0~5. NaN이면 미표시 */
    rating: { type: Number, default: NaN },
    /** 리뷰 수. NaN이면 미표시 */
    reviewCount: { type: Number, default: NaN }, // attr: review-count
    /** 좌상단 배지 텍스트 */
    badge: { type: String },
    /** 카테고리/브랜드 */
    brand: { type: String },
    /** 위시리스트 버튼 노출 (v2 onWishlist 존재) */
    wishlistable: { type: Boolean, reflect: true },
    /** 위시리스트에 담김 */
    wishlisted: { type: Boolean, reflect: true },
    /** 장바구니 버튼 노출 (v2 onAddToCart 존재) */
    addToCart: { type: Boolean, reflect: true }, // attr: add-to-cart
    addToCartLabel: { type: String, default: "장바구니" }, // attr: add-to-cart-label
    /** 품절 등 비활성 */
    disabled: { type: Boolean, reflect: true },
    outOfStockLabel: { type: String, default: "품절" }, // attr: out-of-stock-label
    /** 상세 이동 링크 — 있으면 전면 오버레이가 <a href>가 된다 */
    href: { type: String },
    /** href 없이 클릭만 필요할 때 — 전면 오버레이가 <button>(jd-select 발행) */
    interactive: { type: Boolean, reflect: true },
  };

  declare title: string;
  declare image: string;
  declare imageRatio: string;
  declare price: string;
  declare rating: number;
  declare reviewCount: number;
  declare badge: string;
  declare brand: string;
  declare wishlistable: boolean;
  declare wishlisted: boolean;
  declare addToCart: boolean;
  declare addToCartLabel: string;
  declare disabled: boolean;
  declare outOfStockLabel: string;
  declare href: string;
  declare interactive: boolean;

  #titleId = jdUid("jd-pc-title");
  #badge!: HTMLElement;
  #wishlist!: HTMLButtonElement;
  #wishIcon!: SVGElement;
  #media!: HTMLElement;
  #img!: HTMLImageElement;
  #placeholder!: HTMLElement;
  #stock!: HTMLElement;
  #stockLabel!: HTMLElement;
  #brand!: HTMLElement;
  #title!: HTMLElement;
  #rating!: HTMLElement;
  #ratingValue!: HTMLElement;
  #ratingCount!: HTMLElement;
  #price!: HTMLElement;
  #cart!: HTMLButtonElement;
  #link: HTMLAnchorElement | HTMLButtonElement | null = null;
  #hasPriceSlot = false;

  protected render(): void {
    adoptStyles(productCardStyles);
    const main = this.querySelector<HTMLElement>(`:scope > .${CLS}__main`);
    if (main) {
      this.#adopt(main);
    } else {
      this.#build();
    }
    this.update();
  }

  #adopt(main: HTMLElement): void {
    this.#badge = this.querySelector<HTMLElement>(`:scope > .${CLS}__badge`)!;
    this.#wishlist = this.querySelector<HTMLButtonElement>(`:scope > .${CLS}__wishlist`)!;
    this.#wishIcon = this.#wishlist.querySelector<SVGElement>("svg")!;
    this.#media = main.querySelector<HTMLElement>(`.${CLS}__media`)!;
    this.#img = main.querySelector<HTMLImageElement>(`.${CLS}__image`)!;
    this.#placeholder = main.querySelector<HTMLElement>(`.${CLS}__placeholder`)!;
    this.#stock = main.querySelector<HTMLElement>(`.${CLS}__stock`)!;
    this.#stockLabel = this.#stock.querySelector<HTMLElement>(`.${CLS}__stock-label`)!;
    this.#brand = main.querySelector<HTMLElement>(`.${CLS}__brand`)!;
    this.#title = main.querySelector<HTMLElement>(`.${CLS}__title`)!;
    // 프리렌더가 부여한 제목 id를 승계한다 — 안 그러면 오버레이 링크의
    // aria-labelledby가 새 카운터 값을 가리켜 참조가 끊긴다(프리렌더 스냅샷 함정).
    if (this.#title.id) this.#titleId = this.#title.id;
    else this.#title.id = this.#titleId;
    this.#rating = main.querySelector<HTMLElement>(`.${CLS}__rating`)!;
    this.#ratingValue = this.#rating.querySelector<HTMLElement>(`.${CLS}__rating-value`)!;
    this.#ratingCount = this.#rating.querySelector<HTMLElement>(`.${CLS}__rating-count`)!;
    this.#price = main.querySelector<HTMLElement>(`.${CLS}__price`)!;
    this.#cart = this.querySelector<HTMLButtonElement>(`:scope > .${CLS}__cart`)!;
    this.#hasPriceSlot = this.#price.children.length > 0;
    this.#link = this.querySelector(`:scope > .${CLS}__link`) as
      | HTMLAnchorElement
      | HTMLButtonElement
      | null;
    if (this.#link && this.#link.tagName === "BUTTON") {
      this.#link.addEventListener("click", this.#onSelect);
    }
  }

  #build(): void {
    const doc = this.ownerDocument;
    // 가격 슬롯을 골격 구축 전에 회수(자식으로 넘어온 <jd-price-display slot="price"> 등)
    const priceSlot = this.querySelector<HTMLElement>(':scope > [slot="price"]');

    // 배지
    this.#badge = span(doc, `${CLS}__badge`);

    // 위시리스트
    this.#wishlist = doc.createElement("button");
    this.#wishlist.type = "button";
    this.#wishlist.className = `${CLS}__wishlist`;
    this.#wishIcon = doc.createElementNS(NS, "svg");
    this.#wishIcon.setAttribute("class", `${CLS}__wishlist-icon`);
    this.#wishIcon.setAttribute("viewBox", "0 0 24 24");
    this.#wishIcon.setAttribute("aria-hidden", "true");
    const heart = doc.createElementNS(NS, "path");
    heart.setAttribute("d", HEART_PATH);
    heart.setAttribute("stroke-linecap", "round");
    heart.setAttribute("stroke-linejoin", "round");
    this.#wishIcon.append(heart);
    this.#wishlist.append(this.#wishIcon);

    // 미디어
    this.#img = doc.createElement("img");
    this.#img.className = `${CLS}__image`;
    this.#img.loading = "lazy";
    this.#img.decoding = "async";
    this.#img.alt = "";
    this.#placeholder = span(doc, `${CLS}__placeholder`);
    this.#placeholder.textContent = "이미지 없음";
    this.#placeholder.setAttribute("aria-hidden", "true");
    this.#stockLabel = span(doc, `${CLS}__stock-label`);
    this.#stock = span(doc, `${CLS}__stock`);
    this.#stock.append(this.#stockLabel);
    this.#media = span(doc, `${CLS}__media`);
    this.#media.append(this.#img, this.#placeholder, this.#stock);

    // 본문
    this.#brand = span(doc, `${CLS}__brand`);
    this.#title = doc.createElement("h3");
    this.#title.className = `${CLS}__title`;
    this.#title.id = this.#titleId;
    const star = span(doc, `${CLS}__star`);
    star.textContent = "★";
    star.setAttribute("aria-hidden", "true");
    this.#ratingValue = span(doc, `${CLS}__rating-value`);
    this.#ratingCount = span(doc, `${CLS}__rating-count`);
    this.#rating = span(doc, `${CLS}__rating`);
    this.#rating.setAttribute("role", "img"); // aria-label을 읽히려면 역할 필요
    this.#rating.append(star, this.#ratingValue, this.#ratingCount);
    this.#price = span(doc, `${CLS}__price`);
    const body = span(doc, `${CLS}__body`);
    body.append(this.#brand, this.#title, this.#rating, this.#price);

    const main = span(doc, `${CLS}__main`);
    main.append(this.#media, body);

    // 장바구니
    this.#cart = doc.createElement("button");
    this.#cart.type = "button";
    this.#cart.className = `${CLS}__cart`;

    this.append(this.#badge, this.#wishlist, main, this.#cart);

    // 가격 슬롯 이관
    if (priceSlot) {
      priceSlot.removeAttribute("slot");
      this.#price.append(priceSlot);
      this.#hasPriceSlot = true;
    }
  }

  protected override connected(): void {
    this.#wishlist.addEventListener("click", this.#onWishlist);
    this.#cart.addEventListener("click", this.#onAdd);
  }

  protected override disconnected(): void {
    this.#wishlist?.removeEventListener("click", this.#onWishlist);
    this.#cart?.removeEventListener("click", this.#onAdd);
    if (this.#link && this.#link.tagName === "BUTTON")
      this.#link.removeEventListener("click", this.#onSelect);
  }

  #onSelect = (): void => {
    if (this.disabled) return;
    this.emit("jd-select");
  };

  #onWishlist = (e: Event): void => {
    e.stopPropagation();
    this.emit("jd-wishlist", { wishlisted: !this.wishlisted });
  };

  #onAdd = (e: Event): void => {
    e.stopPropagation();
    if (this.disabled) return;
    this.emit("jd-add");
  };

  /** 전면 오버레이 링크를 필요 태그로 맞춘다(a↔button↔없음). 자식이 없어 교체가 저렴 */
  #syncLink(): void {
    const usable = !this.disabled;
    const wantTag = usable && this.href ? "a" : usable && this.interactive ? "button" : null;
    const curTag = this.#link ? this.#link.tagName.toLowerCase() : null;
    if (wantTag !== curTag) {
      if (this.#link) {
        if (this.#link.tagName === "BUTTON") this.#link.removeEventListener("click", this.#onSelect);
        this.#link.remove();
        this.#link = null;
      }
      if (wantTag === "a") {
        const a = this.ownerDocument.createElement("a");
        a.className = `${CLS}__link`;
        this.append(a);
        this.#link = a;
      } else if (wantTag === "button") {
        const b = this.ownerDocument.createElement("button");
        b.type = "button";
        b.className = `${CLS}__link`;
        b.addEventListener("click", this.#onSelect);
        this.append(b);
        this.#link = b;
      }
    }
    if (this.#link) {
      if (this.#link.tagName === "A") (this.#link as HTMLAnchorElement).href = this.href;
      if (this.title) this.#link.setAttribute("aria-labelledby", this.#titleId);
      else this.#link.removeAttribute("aria-labelledby");
    }
    this.toggleAttribute("data-clickable", Boolean(this.#link));
  }

  protected override update(): void {
    // 배지
    this.#badge.textContent = this.badge;
    this.#badge.hidden = !this.badge;

    // 위시리스트
    this.#wishlist.hidden = !this.wishlistable;
    this.#wishlist.setAttribute("aria-pressed", String(this.wishlisted));
    this.#wishlist.setAttribute(
      "aria-label",
      this.wishlisted ? "위시리스트에서 제거" : "위시리스트에 추가",
    );
    this.#wishlist.toggleAttribute("data-on", this.wishlisted);

    // 미디어
    this.#media.style.aspectRatio = this.imageRatio;
    const hasImage = Boolean(this.image);
    if (hasImage) this.#img.src = this.image;
    else this.#img.removeAttribute("src"); // src 없는 <img>는 깨진 아이콘을 그리지 않는다
    this.#img.alt = this.title || "";
    // img는 늘 자리를 지키고(비면 빈 박스), 플레이스홀더가 위를 덮는다 —
    // display를 지정한 요소는 hidden이 안 먹으므로 CSS [hidden] 가드를 함께 둔다.
    this.#placeholder.hidden = hasImage;
    this.#stockLabel.textContent = this.outOfStockLabel;
    this.#stock.hidden = !this.disabled;

    // 본문
    this.#brand.textContent = this.brand;
    this.#brand.hidden = !this.brand;
    this.#title.textContent = this.title;

    const hasRating = !Number.isNaN(this.rating);
    this.#rating.hidden = !hasRating;
    if (hasRating) {
      const val = this.rating.toFixed(1);
      this.#ratingValue.textContent = val;
      const hasCount = !Number.isNaN(this.reviewCount);
      this.#ratingCount.textContent = hasCount ? `(${this.reviewCount.toLocaleString()})` : "";
      this.#ratingCount.hidden = !hasCount;
      this.#rating.setAttribute(
        "aria-label",
        hasCount
          ? `평점 5점 만점에 ${val}점, 리뷰 ${this.reviewCount.toLocaleString()}개`
          : `평점 5점 만점에 ${val}점`,
      );
    }

    // 가격 — 슬롯이 있으면 건드리지 않는다
    if (!this.#hasPriceSlot) this.#price.textContent = this.price;
    this.#price.hidden = !this.#hasPriceSlot && !this.price;

    // 장바구니 — v2: 품절이면 숨긴다
    const showCart = this.addToCart && !this.disabled;
    this.#cart.hidden = !showCart;
    this.#cart.textContent = this.addToCartLabel;

    this.#syncLink();
  }
}
