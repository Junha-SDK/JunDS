/**
 * <jd-page-shell> — 페이지 골격: 제목·설명·액션 헤더 + 본문 (v2 finance/PageShell).
 *
 * v2는 title/description/actions/children + maxWidth 프리셋(narrow/content/default/
 * wide/full 또는 숫자)으로 페이지 상단을 정돈했다. CE는 라이트 DOM이라 본문은 호스트의
 * 자식이 그대로 되고, 액션은 `slot="actions"` 자식으로 받는다(jd-modal의 childNodes 이동
 * 관용과 동형 — 여기선 본문을 안쪽 래퍼로 감싸고 액션만 헤더로 끌어 올린다).
 *
 * v2 대비 개선:
 *  1. 제목이 <h1>로 문서 개요에 들어가고 상단이 <header>로 표식된다(v2는 그냥 div였다).
 *  2. maxWidth는 안쪽 래퍼의 인라인 max-width로만 적용 — 숫자·프리셋 모두 문자 단위
 *     결정적이다(§3.1-3). "full"은 상한 없음.
 *  3. v2는 title이 없으면 actions까지 통째로 사라졌다. v3는 actions가 있으면 헤더를
 *     남긴다 — 제목 없는 툴바 페이지에서도 액션이 유지된다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import pageShellStyles from "./page-shell.css.js";

/** v2 WIDTH_PRESETS — px */
const WIDTH_PRESETS: Record<string, number> = {
  narrow: 920,
  content: 1180,
  default: 1440,
  wide: 1600,
};

export class JdPageShell extends JdElement {
  static override tag = "jd-page-shell";
  static override props = {
    /** 페이지 제목(h1). v2 title */
    title: { type: String },
    /** 제목 아래 보조 설명. v2 description */
    description: { type: String },
    /** narrow | content | default | wide | full | 숫자(px). v2 maxWidth */
    maxWidth: { type: String, default: "default", attribute: "max-width" },
  };

  declare title: string;
  declare description: string;
  declare maxWidth: string;

  #inner!: HTMLDivElement;
  #header!: HTMLElement;
  #titleEl!: HTMLHeadingElement;
  #descEl!: HTMLParagraphElement;
  #actionsEl!: HTMLDivElement;

  protected render(): void {
    adoptStyles(pageShellStyles);

    // 입양(§3.3): 프리렌더/어댑터가 그린 골격이 있으면 재사용
    const inner = this.querySelector<HTMLDivElement>(":scope > .jd-page-shell__inner");
    if (inner) {
      this.#inner = inner;
      this.#header = inner.querySelector(".jd-page-shell__header")!;
      this.#titleEl = inner.querySelector(".jd-page-shell__title")!;
      this.#descEl = inner.querySelector(".jd-page-shell__desc")!;
      this.#actionsEl = inner.querySelector(".jd-page-shell__actions")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const doc = this.ownerDocument;
    this.#inner = doc.createElement("div");
    this.#inner.className = "jd-page-shell__inner";

    const body = doc.createElement("div");
    body.className = "jd-page-shell__body";
    body.append(...this.childNodes); // 저작 본문을 안쪽으로 이동

    this.#header = doc.createElement("header");
    this.#header.className = "jd-page-shell__header";
    const titles = doc.createElement("div");
    titles.className = "jd-page-shell__titles";
    this.#titleEl = doc.createElement("h1");
    this.#titleEl.className = "jd-page-shell__title";
    this.#descEl = doc.createElement("p");
    this.#descEl.className = "jd-page-shell__desc";
    titles.append(this.#titleEl, this.#descEl);
    this.#actionsEl = doc.createElement("div");
    this.#actionsEl.className = "jd-page-shell__actions";
    // 저작이 slot="actions"로 표식한 자식을 헤더로 끌어 올린다
    for (const el of body.querySelectorAll<HTMLElement>(":scope > [slot='actions']")) {
      el.removeAttribute("slot");
      this.#actionsEl.append(el);
    }
    this.#header.append(titles, this.#actionsEl);

    this.#inner.append(this.#header, body);
    this.append(this.#inner);
  }

  protected override update(): void {
    const title = this.title;
    const desc = this.description;
    this.#titleEl.textContent = title;
    this.#titleEl.hidden = !title;
    this.#descEl.textContent = desc;
    this.#descEl.hidden = !desc;
    // 제목이나 액션이 있어야 헤더를 남긴다
    this.#header.hidden = !title && this.#actionsEl.childElementCount === 0;
    this.#inner.style.maxWidth = this.#resolveMaxWidth();
  }

  /** narrow/content/default/wide → px, full → 상한 없음, 숫자 → px */
  #resolveMaxWidth(): string {
    const raw = (this.maxWidth || "default").trim();
    if (raw === "full") return "";
    const asNum = Number(raw);
    if (Number.isFinite(asNum) && asNum > 0) return `${asNum}px`;
    const preset = WIDTH_PRESETS[raw] ?? WIDTH_PRESETS.default!;
    return `${preset}px`;
  }
}
