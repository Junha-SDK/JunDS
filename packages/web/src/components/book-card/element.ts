/**
 * <jd-book-card> — 책 카드 (v2 composites/BookCard).
 *
 * 표지는 **다시 그리지 않는다** — `<jd-book-cover size="fill">`을 안에 세운다
 * (§6 R12 · jd-accordion→jd-disclosure, jd-avatar-stack→jd-avatar 선례). 그 대가로
 * v2 BookCard에 없던 이미지 실패 폴백이 공짜로 붙는다(v2는 onError에서 img를
 * `display:none`으로 지워 **빈 상자**만 남겼다). 잠금 배지는 <jd-badge variant="warning"
 * size="sm">이라 앰버 칩을 다시 정의하지 않는다.
 *
 * v2 대비 교정 4건:
 *  1. **잠금 문구가 두 번 읽혔다.** v2는 오버레이 텍스트("열쇠가 필요합니다") + 배지
 *     ("권한 필요") + aria-label에 같은 사실을 세 번 실었다. v3는 오버레이·배지를
 *     aria-hidden 장식으로 내리고 이름 한 곳에서만 말한다.
 *  2. **이름이 제목만이었다.** v2 aria-label은 제목(+잠금)뿐이라 화면에 보이는 종류·
 *     저자가 접근성 트리에서 사라졌다. v3는 "제목, 종류, 저자" 순으로 잇는다 —
 *     보이는 제목으로 시작하므로 WCAG 2.5.3(Label in Name)도 지킨다.
 *  3. **마우스만 피드백을 받았다.** v2는 hover에만 상승·그림자가 있었다. v3는
 *     :focus-visible에도 같은 상승을 주고, 이동은 prefers-reduced-motion에서 뺀다
 *     (jd-card 선례).
 *  4. **광택·그레인이 DOM 2개였다.** ::before/::after로 내려 노드를 없앴다.
 *
 * 이벤트: 네이티브 `click`이 그대로 버블한다 — `jd-click` 재발명 금지(§1.5, jd-button
 * 주해 동형). v2 onClick 소비 코드는 어댑터에서 그대로 붙는다.
 *
 * 표면 주의: `title`은 네이티브 프로퍼티와 이름이 겹치지만 v2 프롭명을 지킨다
 * (jd-action-sheet 선례). v2가 **의도적으로** 걸어 둔 네이티브 툴팁은 내부 <button>의
 * title로 재현한다(잠금이면 "열쇠가 필요합니다", 아니면 제목 — v2 동형).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import bookCardStyles from "./book-card.css.js";

const CLS = "jd-book-card";
const LOCK_TEXT = "열쇠가 필요합니다";
const LOCK_BADGE = "권한 필요";
/** v2 BookCard 폴백 그라디언트: from-slate-700 via-slate-600 to-slate-800 */
const CARD_HUE = "linear-gradient(135deg, #334155 0%, #475569 50%, #1e293b 100%)";

function el(doc: Document, tag: string, className: string): HTMLElement {
  const node = doc.createElement(tag);
  node.className = className;
  return node;
}

export class JdBookCard extends JdElement {
  static override tag = "jd-book-card";
  static override props = {
    /** 작품 제목 */
    title: { type: String },
    /** 저자명 */
    author: { type: String },
    /** 표지 이미지 URL */
    coverImage: { type: String }, // attr: cover-image
    /** 잠금 상태 */
    locked: { type: Boolean, reflect: true },
    /** 작품 유형 라벨 */
    kind: { type: String },
  };

  declare title: string;
  declare author: string;
  declare coverImage: string;
  declare locked: boolean;
  declare kind: string;

  #button!: HTMLButtonElement;
  #cover!: HTMLElement;
  #lock!: HTMLElement;
  #title!: HTMLElement;
  #kind!: HTMLElement;
  #author!: HTMLElement;
  #badge!: HTMLElement;

  protected render(): void {
    adoptStyles(bookCardStyles);
    const found = this.querySelector<HTMLButtonElement>(`:scope > button.${CLS}__button`);
    if (found) {
      // 입양(§3.3)
      this.#button = found;
      this.#cover = found.querySelector<HTMLElement>(`.${CLS}__art`)!;
      this.#lock = found.querySelector<HTMLElement>(`.${CLS}__lock`)!;
      this.#title = found.querySelector<HTMLElement>(`.${CLS}__title`)!;
      this.#kind = found.querySelector<HTMLElement>(`.${CLS}__kind`)!;
      this.#author = found.querySelector<HTMLElement>(`.${CLS}__author`)!;
      this.#badge = found.querySelector<HTMLElement>(`.${CLS}__badge`)!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const doc = this.ownerDocument;

    // 표지 — 자식 값은 attribute로 쓴다(업그레이드 전에도 유실 없음, 스냅샷 직렬화)
    this.#cover = doc.createElement("jd-book-cover");
    this.#cover.className = `${CLS}__art`;
    this.#cover.setAttribute("size", "fill");
    this.#cover.setAttribute("hue", CARD_HUE);
    // 이름은 바깥 <button>이 통째로 말한다 — 표지는 장식으로 남긴다
    this.#cover.setAttribute("aria-hidden", "true");

    const lockIcon = el(doc, "span", `${CLS}__lock-icon`);
    lockIcon.textContent = "🔒";
    const lockText = el(doc, "span", `${CLS}__lock-text`);
    lockText.textContent = LOCK_TEXT;
    this.#lock = el(doc, "span", `${CLS}__lock`);
    this.#lock.setAttribute("aria-hidden", "true"); // 잠금은 이름이 이미 말한다
    this.#lock.append(lockIcon, lockText);

    const cover = el(doc, "span", `${CLS}__cover`);
    cover.append(this.#cover, this.#lock);

    this.#title = el(doc, "span", `${CLS}__title`);
    this.#kind = el(doc, "span", `${CLS}__kind`);
    this.#author = el(doc, "span", `${CLS}__author`);
    const sub = el(doc, "span", `${CLS}__sub`);
    sub.append(this.#kind, this.#author);

    this.#badge = doc.createElement("jd-badge");
    this.#badge.className = `${CLS}__badge`;
    this.#badge.setAttribute("variant", "warning");
    this.#badge.setAttribute("size", "sm");
    this.#badge.setAttribute("aria-hidden", "true");
    this.#badge.textContent = LOCK_BADGE;

    const meta = el(doc, "span", `${CLS}__meta`);
    meta.append(this.#title, sub, this.#badge);

    this.#button = doc.createElement("button");
    this.#button.type = "button";
    this.#button.className = `${CLS}__button`;
    this.#button.append(cover, meta);
    this.append(this.#button);
  }

  protected override update(): void {
    if (this.coverImage) this.#cover.setAttribute("src", this.coverImage);
    else this.#cover.removeAttribute("src");

    this.#title.textContent = this.title;
    this.#kind.textContent = this.kind;
    this.#kind.hidden = !this.kind;
    this.#author.textContent = this.author;
    this.#author.hidden = !this.author;

    this.#lock.hidden = !this.locked;
    this.#badge.hidden = !this.locked;

    // 보이는 제목으로 시작해 종류·저자까지 잇는다(v2는 제목만 실었다)
    const parts = [this.title, this.kind, this.author].filter(Boolean);
    const name = parts.join(", ");
    const label = this.locked ? `${name} — ${LOCK_TEXT}` : name;
    if (label) this.#button.setAttribute("aria-label", label);
    else this.#button.removeAttribute("aria-label");
    // v2가 의도적으로 걸어 둔 네이티브 툴팁 — 빈 값이면 attribute 자체를 두지 않는다
    const tip = this.locked ? LOCK_TEXT : this.title;
    if (tip) this.#button.title = tip;
    else this.#button.removeAttribute("title");
  }
}
