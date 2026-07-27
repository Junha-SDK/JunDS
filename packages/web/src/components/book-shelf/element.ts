/**
 * <jd-book-shelf> — 동일 너비 그리드로 책 카드를 정렬 (v2 layout/BookShelf).
 *
 * 자식(`<jd-book-card>` 등)은 내부 `.jd-book-shelf__grid`로 입양된다(§10.1 children
 * 재배치 선례). 열 수·변형은 attribute로 반영해 CSS가 반응형 그리드를 고른다 —
 * v2의 columnsMap(Tailwind 반응형 클래스)을 미디어쿼리로 기계 번역.
 *
 * v2 대비 교정 1건: v2 `<section>`은 라벨이 있어도 접근성 이름이 없었다. v3는 라벨이
 * 있으면 role="group" + aria-labelledby로 선반을 이름 있는 묶음으로 만든다.
 */
import { JdElement } from "../../core/element.js";
import {
  syncAriaIdRefs,
  syncOwnedAttribute,
} from "../../core/aria.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import bookShelfStyles from "./book-shelf.css.js";

const CLS = "jd-book-shelf";

export class JdBookShelf extends JdElement {
  static override tag = "jd-book-shelf";
  static override props = {
    /** 행당 책 수 (3 | 4 | 5 | 6 | 8). 기본 5 */
    columns: { type: Number, default: 5, reflect: true },
    /** wood | minimal | card */
    variant: { type: String, default: "minimal", reflect: true },
    /** 선반 라벨. `slot="label"` 자식이 있으면 그쪽이 우선 */
    label: { type: String },
  };

  declare columns: number;
  declare variant: string;
  declare label: string;

  #header!: HTMLElement;
  #grid!: HTMLElement;
  #labelSlotted = false;

  protected render(): void {
    adoptStyles(bookShelfStyles);

    const existingGrid = this.querySelector<HTMLElement>(`:scope > .${CLS}__grid`);
    const existingHeader = this.querySelector<HTMLElement>(`:scope > .${CLS}__header`);
    if (existingGrid && existingHeader) {
      // 입양(§3.3) — SSR 골격 재사용, 책 카드는 그리드 안에 그대로 둔다
      this.#grid = existingGrid;
      this.#header = existingHeader;
      this.#labelSlotted = existingHeader.querySelector('[slot="label"]') != null;
      this.update();
      return;
    }

    this.#header = document.createElement("header");
    this.#header.className = `${CLS}__header`;
    this.#header.id = jdUid(`${CLS}-label`);
    const slotted = this.querySelector<HTMLElement>(':scope > [slot="label"]');
    if (slotted) {
      this.#header.append(slotted);
      this.#labelSlotted = true;
    }

    this.#grid = document.createElement("div");
    this.#grid.className = `${CLS}__grid`;
    // 남은 자식(책 카드) 전부를 그리드로 이동
    const rest = Array.from(this.childNodes).filter((n) => n !== this.#header);
    this.#grid.append(...rest);

    this.prepend(this.#header, this.#grid);
    this.update();
  }

  protected override update(): void {
    if (!this.#labelSlotted) this.#header.textContent = this.label;
    const hasLabel = this.#labelSlotted || Boolean(this.label);
    this.#header.hidden = !hasLabel;

    if (hasLabel) {
      if (!this.#header.id) this.#header.id = jdUid(`${CLS}-label`);
      syncOwnedAttribute(this, "role", "group", { preserveExisting: true });
      syncAriaIdRefs(this, "aria-labelledby", this.#header.id);
    } else {
      syncOwnedAttribute(this, "role", null);
      syncAriaIdRefs(this, "aria-labelledby", null);
    }
  }
}
