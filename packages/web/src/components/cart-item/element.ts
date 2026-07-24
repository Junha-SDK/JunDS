/**
 * <jd-cart-item> — 장바구니 아이템 행 (v2 composites/CartItem).
 *   썸네일 + 정보 + 수량 조절 + 소계 + 삭제.
 *
 * v2 대비 교정:
 *  1. 수량 위젯을 다시 그리지 않는다 — `<jd-quantity-selector>`를 세운다(§6 R12 · jd-book-card가
 *     jd-book-cover를, jd-quantity-selector가 jd-number-input을 재사용한 선례). 그 대가로 v2에
 *     없던 것이 공짜로 붙는다: 상/하한 클램프, 폼 참여, 그리고 **값이 포커스로 읽히는 접근성**
 *     (v2는 수량을 `<span aria-live>`로 그려 스크린리더가 현재 수량을 읽으러 갈 수 없었다).
 *  2. 삭제 버튼에 접근 이름을 붙인다("<상품명> 삭제") — v2는 "삭제"만 있어 여러 행에서
 *     구분되지 않았다.
 *
 * 이벤트(§1.5):
 *  · 수량 변경 → `jd-quantity-change` { quantity }. 비제어 — 소비자가 quantity/subtotal을
 *    되반영하면 되고, 안 해도 위젯은 자기 값을 유지한다. 내부 jd-change는 host에서 멈춘다.
 *  · 삭제 → `jd-remove`.
 *
 * 가격/소계는 리치 콘텐츠가 흔해 `[slot="price"]`/`[slot="subtotal"]` 자식(예: <jd-price-display>)을
 *   우선 수용하고, 없으면 `price`/`subtotal` 문자열을 쓴다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import cartItemStyles from "./cart-item.css.js";

const CLS = "jd-cart-item";

function make(doc: Document, tag: string, className: string): HTMLElement {
  const n = doc.createElement(tag);
  n.className = className;
  return n;
}

export class JdCartItem extends JdElement {
  static override tag = "jd-cart-item";
  static override props = {
    title: { type: String },
    /** 옵션/사이즈/색상 등 보조 정보 */
    variant: { type: String },
    image: { type: String },
    /** 단가 텍스트 — [slot="price"] 자식이 있으면 그쪽이 이긴다 */
    price: { type: String },
    /** 소계 텍스트 — [slot="subtotal"] 자식이 있으면 그쪽이 이긴다 */
    subtotal: { type: String },
    quantity: { type: Number, default: 1 },
    min: { type: Number, default: 1 },
    /** 재고 상한. NaN이면 상한 없음 */
    max: { type: Number, default: NaN },
    /** 삭제 버튼 노출 (v2 onRemove 존재) */
    removable: { type: Boolean, reflect: true },
    /** 수량 직접 입력 금지(± 버튼만) */
    readonly: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare title: string;
  declare variant: string;
  declare image: string;
  declare price: string;
  declare subtotal: string;
  declare quantity: number;
  declare min: number;
  declare max: number;
  declare removable: boolean;
  declare readonly: boolean;
  declare disabled: boolean;

  #thumb!: HTMLElement;
  #img!: HTMLImageElement;
  #title!: HTMLElement;
  #variant!: HTMLElement;
  #price!: HTMLElement;
  #qty!: HTMLElement;
  #subtotal!: HTMLElement;
  #remove!: HTMLButtonElement;
  #hasPriceSlot = false;
  #hasSubtotalSlot = false;

  protected render(): void {
    adoptStyles(cartItemStyles);
    const body = this.querySelector<HTMLElement>(`:scope > .${CLS}__body`);
    if (body) {
      this.#adopt(body);
    } else {
      this.#build();
    }
    this.update();
  }

  #adopt(body: HTMLElement): void {
    this.#thumb = this.querySelector<HTMLElement>(`:scope > .${CLS}__thumb`)!;
    this.#img = this.#thumb.querySelector<HTMLImageElement>(`.${CLS}__image`)!;
    this.#title = body.querySelector<HTMLElement>(`.${CLS}__title`)!;
    this.#variant = body.querySelector<HTMLElement>(`.${CLS}__variant`)!;
    this.#price = body.querySelector<HTMLElement>(`.${CLS}__price`)!;
    this.#qty = body.querySelector<HTMLElement>(`.${CLS}__qty`)!;
    const aside = this.querySelector<HTMLElement>(`:scope > .${CLS}__aside`)!;
    this.#subtotal = aside.querySelector<HTMLElement>(`.${CLS}__subtotal`)!;
    this.#remove = aside.querySelector<HTMLButtonElement>(`.${CLS}__remove`)!;
    this.#hasPriceSlot = this.#price.children.length > 0;
    this.#hasSubtotalSlot = this.#subtotal.children.length > 0;
  }

  #build(): void {
    const doc = this.ownerDocument;
    const priceSlot = this.querySelector<HTMLElement>(':scope > [slot="price"]');
    const subtotalSlot = this.querySelector<HTMLElement>(':scope > [slot="subtotal"]');

    // 썸네일
    this.#img = doc.createElement("img");
    this.#img.className = `${CLS}__image`;
    this.#img.loading = "lazy";
    this.#img.decoding = "async";
    this.#img.alt = "";
    this.#thumb = make(doc, "span", `${CLS}__thumb`);
    this.#thumb.append(this.#img);

    // 본문
    this.#title = make(doc, "h4", `${CLS}__title`);
    this.#variant = make(doc, "span", `${CLS}__variant`);
    this.#price = make(doc, "span", `${CLS}__price`);
    this.#qty = doc.createElement("jd-quantity-selector");
    this.#qty.className = `${CLS}__qty`;
    const body = make(doc, "div", `${CLS}__body`);
    body.append(this.#title, this.#variant, this.#price, this.#qty);

    // 우측
    this.#subtotal = make(doc, "span", `${CLS}__subtotal`);
    this.#remove = doc.createElement("button");
    this.#remove.type = "button";
    this.#remove.className = `${CLS}__remove`;
    this.#remove.textContent = "삭제";
    const aside = make(doc, "div", `${CLS}__aside`);
    aside.append(this.#subtotal, this.#remove);

    this.append(this.#thumb, body, aside);

    if (priceSlot) {
      priceSlot.removeAttribute("slot");
      this.#price.append(priceSlot);
      this.#hasPriceSlot = true;
    }
    if (subtotalSlot) {
      subtotalSlot.removeAttribute("slot");
      this.#subtotal.append(subtotalSlot);
      this.#hasSubtotalSlot = true;
    }
  }

  protected override connected(): void {
    this.#qty.addEventListener("jd-change", this.#onQty as EventListener);
    this.#remove.addEventListener("click", this.#onRemove);
  }

  protected override disconnected(): void {
    this.#qty?.removeEventListener("jd-change", this.#onQty as EventListener);
    this.#remove?.removeEventListener("click", this.#onRemove);
  }

  /** 내부 jd-quantity-selector의 jd-change를 흡수해 jd-quantity-change로 재발행 */
  #onQty = (e: CustomEvent<{ value: number }>): void => {
    e.stopPropagation();
    const raw = e.detail?.value;
    const q = Number.isFinite(raw) ? (raw as number) : this.min;
    this.quantity = q; // 비제어 내부 상태 동기화
    this.emit("jd-quantity-change", { quantity: q });
  };

  #onRemove = (): void => {
    if (this.disabled) return;
    this.emit("jd-remove");
  };

  protected override update(): void {
    // 썸네일
    const hasImage = Boolean(this.image);
    if (hasImage) this.#img.src = this.image;
    else this.#img.removeAttribute("src");
    this.#thumb.hidden = !hasImage;

    // 본문
    this.#title.textContent = this.title;
    this.#variant.textContent = this.variant;
    this.#variant.hidden = !this.variant;
    if (!this.#hasPriceSlot) this.#price.textContent = this.price;
    this.#price.hidden = !this.#hasPriceSlot && !this.price;

    // 수량 위젯 — 속성 위임(클래스 import 없이, jd-book-card→jd-book-cover 선례)
    const qty = this.#qty;
    qty.setAttribute("value", String(this.quantity));
    qty.setAttribute("min", String(this.min));
    if (Number.isNaN(this.max)) qty.removeAttribute("max");
    else qty.setAttribute("max", String(this.max));
    qty.toggleAttribute("readonly", this.readonly);
    qty.toggleAttribute("disabled", this.disabled);
    qty.setAttribute("label", this.title ? `${this.title} 수량` : "수량");

    // 우측
    if (!this.#hasSubtotalSlot) this.#subtotal.textContent = this.subtotal;
    this.#subtotal.hidden = !this.#hasSubtotalSlot && !this.subtotal;
    this.#remove.hidden = !this.removable;
    this.#remove.disabled = this.disabled;
    this.#remove.setAttribute("aria-label", this.title ? `${this.title} 삭제` : "삭제");
  }
}
