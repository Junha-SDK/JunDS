/**
 * <jd-annotation-note> — 하이라이트 인용 + 메모 카드 (v2 composites/AnnotationNote).
 *
 * 인용 본문은 무슬롯 children(또는 `quote` 텍스트 프롭), 메모는 `note` 프롭 또는
 * `slot="note"` children(v2 `note: ReactNode` 자리 — DEC-014-4 슬롯 규약).
 *
 * v2 대비 교정 5건:
 *  1. **클릭 카드가 접근 불가능했다.** `<article onClick>`에 role도 tabindex도 키보드
 *     경로도 없었다. v3는 `clickable`을 켜면 카드에 role="button" + tabindex="0" +
 *     Enter/Space가 붙는다(키 처리는 behaviors/createKeyHandler 재사용 — StatCard 선례).
 *     클릭 자체는 네이티브 click이 그대로 버블한다(`jd-click` 재발명 없음, §1.5).
 *  2. **삭제가 콜백 프롭이었다.** 바닐라에는 콜백을 실을 자리가 없으므로 `deletable`
 *     불리언이 버튼을 켜고, 누르면 `jd-remove`를 발행한다(§1.5 canonical · jd-tag 동형).
 *     실제 제거는 소비자 몫 — v2 onDelete 계약 그대로다. 리스너는 버튼에 직접 달아
 *     v2의 stopPropagation(카드 클릭과 겹치지 않음)이 호스트 리스너 순서와 무관하게 선다.
 *  3. **시각이 맨 텍스트였다.** 기계 판독이 불가능했다 — v3는 `<time datetime>`이고,
 *     `2026-04-30`처럼 날짜만 주면 UTC로 읽고 UTC로 포맷한다(사용자 시간대에 따라
 *     적어 둔 날짜가 하루 밀리는 v2 함정 차단). 파싱 실패 시 원문을 그대로 보인다.
 *  4. **인용부호가 본문 텍스트였다.** `"{quote}"`라 복사·AT 낭독·검색에 따옴표가
 *     섞였다 — v3는 CSS `open-quote/close-quote`(글리프는 v2와 같은 `"`).
 *  5. **빈 footer가 8px를 먹었다.** page·날짜·삭제가 전부 없으면 footer를 숨긴다.
 *
 * color 5종 분기는 호스트 속성 셀렉터가 담당한다(§4.3) — JS 분기 없음.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createKeyHandler } from "../../behaviors/input.js";
import annotationNoteStyles from "./annotation-note.css.js";

const CLOSE_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

/** i18n Behavior 합류 시 재연결 (DEC-023-5 선례) */
const DELETE_LABEL = "메모 삭제";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

let warnedLocale = false;

export class JdAnnotationNote extends JdElement {
  static override tag = "jd-annotation-note";
  static override props = {
    /** 인용 본문 텍스트. 미지정이면 children이 본문이다 */
    quote: { type: String },
    /** 사용자 메모. 미지정이면 slot="note" children */
    note: { type: String },
    /** ISO 문자열(또는 Date 프로퍼티). attr: created-at */
    createdAt: { type: String },
    /** 미지정(NaN)이면 쪽수를 표시하지 않는다 (v2 `page !== undefined` 동형) */
    page: { type: Number, default: NaN },
    /** yellow | green | blue | pink | orange */
    color: { type: String, default: "yellow", reflect: true },
    /** 날짜 표기 로케일 (jd-clock 동형 — 부정한 값은 기본값 폴백) */
    locale: { type: String, default: "ko" },
    /** 삭제 버튼 노출 — 누르면 jd-remove (v2 onDelete 자리) */
    deletable: { type: Boolean, reflect: true },
    /** 카드 전체를 버튼처럼 다룬다 (v2 onClick의 접근 가능한 표면) */
    clickable: { type: Boolean, reflect: true },
  };

  declare quote: string;
  declare note: string;
  declare createdAt: string;
  declare page: number;
  declare color: string;
  declare locale: string;
  declare deletable: boolean;
  declare clickable: boolean;

  #article!: HTMLElement;
  #quote!: HTMLQuoteElement;
  #note!: HTMLParagraphElement;
  #footer!: HTMLElement;
  #page!: HTMLSpanElement;
  #date!: HTMLTimeElement;
  /** 현재 리스너가 붙어 있는 삭제 버튼 — 입양 골격에도 한 번만 붙인다 */
  #bound: HTMLButtonElement | null = null;
  /** slot="note" children이 있으면 텍스트 프롭이 그것을 덮어쓰지 않는다 */
  #slottedNote = false;

  #fmt: Intl.DateTimeFormat | undefined;
  #fmtKey = "";

  protected render(): void {
    adoptStyles(annotationNoteStyles);
    // 입양(§3.3) — SSR/프리렌더/어댑터가 그린 골격이 있으면 재사용
    const found = this.querySelector<HTMLElement>(":scope > article.jd-annotation-note");
    if (found) {
      this.#article = found;
      this.#quote = found.querySelector(".jd-annotation-note__quote")!;
      this.#note = found.querySelector(".jd-annotation-note__note")!;
      this.#footer = found.querySelector(".jd-annotation-note__footer")!;
      this.#page = found.querySelector(".jd-annotation-note__page")!;
      this.#date = found.querySelector(".jd-annotation-note__date")!;
      this.#slottedNote = this.#note.childElementCount > 0;
      this.update();
      return;
    }

    const slotted = this.querySelector(':scope > [slot="note"]');
    const rest = Array.from(this.childNodes).filter((n) => n !== slotted);

    this.#quote = document.createElement("blockquote");
    this.#quote.className = "jd-annotation-note__quote";
    this.#quote.append(...rest);

    this.#note = document.createElement("p");
    this.#note.className = "jd-annotation-note__note";
    if (slotted) {
      this.#note.append(slotted);
      this.#slottedNote = true;
    }

    this.#page = document.createElement("span");
    this.#page.className = "jd-annotation-note__page";
    this.#date = document.createElement("time");
    this.#date.className = "jd-annotation-note__date";
    const meta = document.createElement("div");
    meta.className = "jd-annotation-note__meta";
    meta.append(this.#page, this.#date);

    this.#footer = document.createElement("footer");
    this.#footer.className = "jd-annotation-note__footer";
    this.#footer.append(meta);

    this.#article = document.createElement("article");
    this.#article.className = "jd-annotation-note";
    this.#article.append(this.#quote, this.#note, this.#footer);
    this.append(this.#article);
    this.update();
  }

  protected override connected(): void {
    // clickable 여부는 콜백 안에서 본다 — 프로퍼티가 나중에 켜져도 동작한다.
    // 카드 안 버튼에 포커스가 있을 때는 그쪽 기본 동작이 정본이므로 비켜준다.
    const activate = (e: KeyboardEvent): void => {
      if (!this.clickable || e.target !== this.#article) return;
      e.preventDefault(); // Space 스크롤 차단 — 우리가 처리한 키에만
      this.#article.click(); // 네이티브 click으로 합류 — 리스너는 하나면 된다(§1.5)
    };
    // preventDefault는 직접 한다: Behavior 기본값(true)은 매칭 즉시 취소해
    // 카드 안 삭제 버튼의 Enter/Space 활성화까지 막는다(StatCard와 같은 이유).
    this.own(createKeyHandler(this, { enter: activate, space: activate }, { preventDefault: false }));
  }

  #onDelete = (e: Event): void => {
    e.stopPropagation(); // 카드 클릭과 겹치지 않는다(v2 동형)
    this.emit("jd-remove");
  };

  /** 로케일이 부정하면 예외 없이 폴백한다(1회 경고 — jd-clock 동형) */
  #formatter(utc: boolean): Intl.DateTimeFormat {
    const locale = this.locale || "ko";
    const key = `${locale}|${utc ? 1 : 0}`;
    if (this.#fmt && this.#fmtKey === key) return this.#fmt;
    const opts: Intl.DateTimeFormatOptions = { year: "2-digit", month: "short", day: "numeric" };
    if (utc) opts.timeZone = "UTC";
    let fmt: Intl.DateTimeFormat;
    try {
      fmt = new Intl.DateTimeFormat(locale, opts);
    } catch {
      if (!warnedLocale) {
        warnedLocale = true;
        console.warn(`[junds] <jd-annotation-note> locale을 해석하지 못해 "ko"로 폴백합니다: "${locale}"`);
      }
      fmt = new Intl.DateTimeFormat("ko", opts);
    }
    this.#fmt = fmt;
    this.#fmtKey = key;
    return fmt;
  }

  /** 표시 텍스트 + `<time datetime>` 기계 판독 값. 값이 없으면 null */
  #formatDate(): { text: string; iso: string } | null {
    const raw: unknown = this.createdAt;
    if (raw === null || raw === undefined || raw === "") return null;
    if (raw instanceof Date) {
      if (Number.isNaN(raw.getTime())) return null;
      return { text: this.#formatter(false).format(raw), iso: raw.toISOString() };
    }
    const s = String(raw);
    // 날짜만 오면 UTC 자정으로 읽고 UTC로 포맷한다 — 시간대에 따라 하루 밀리지 않게
    const dateOnly = DATE_ONLY.test(s);
    const dt = new Date(dateOnly ? `${s}T00:00:00Z` : s);
    if (Number.isNaN(dt.getTime())) return { text: s, iso: "" }; // 파싱 실패 = 원문 노출
    return {
      text: this.#formatter(dateOnly).format(dt),
      iso: dateOnly ? s : dt.toISOString(),
    };
  }

  protected override update(): void {
    if (this.quote) this.#quote.textContent = this.quote;
    if (!this.#slottedNote) this.#note.textContent = this.note;
    this.#note.hidden = !this.#slottedNote && !this.note;

    const hasPage = !Number.isNaN(this.page);
    this.#page.textContent = hasPage ? `p.${this.page}` : "";
    this.#page.hidden = !hasPage;

    const date = this.#formatDate();
    this.#date.textContent = date ? date.text : "";
    this.#date.hidden = !date;
    if (date?.iso) this.#date.setAttribute("datetime", date.iso);
    else this.#date.removeAttribute("datetime");

    let del = this.#footer.querySelector<HTMLButtonElement>(":scope > .jd-annotation-note__delete");
    if (this.deletable && !del) {
      del = document.createElement("button");
      del.type = "button";
      del.className = "jd-annotation-note__delete";
      del.setAttribute("aria-label", DELETE_LABEL);
      del.innerHTML = CLOSE_SVG;
      this.#footer.append(del);
    } else if (!this.deletable && del) {
      del.remove();
      del = null;
    }
    if (this.#bound !== del) {
      this.#bound?.removeEventListener("click", this.#onDelete);
      del?.addEventListener("click", this.#onDelete);
      this.#bound = del;
    }

    this.#footer.hidden = !hasPage && !date && !this.deletable;

    if (this.clickable) {
      this.#article.setAttribute("role", "button");
      if (!this.#article.hasAttribute("tabindex")) this.#article.setAttribute("tabindex", "0");
    } else {
      this.#article.removeAttribute("role");
      if (this.#article.getAttribute("tabindex") === "0") this.#article.removeAttribute("tabindex");
    }
  }
}
