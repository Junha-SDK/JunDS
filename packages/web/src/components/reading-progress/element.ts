/**
 * <jd-reading-progress> — 독서 진행률 (v2 composites/ReadingProgress).
 *
 * 두 골격(compact 한 줄 / full 헤더+바+푸터)은 구조가 달라 compact 값이 바뀌면 골격을
 * 다시 세운다. 진행 바는 트랙 div가 role="progressbar"를 갖는다(jd-progress-bar 선례 —
 * 폭 0%면 사라지는 채움이 아니라 트랙이 위젯 경계).
 *
 * v2 대비 교정 2건:
 *  1. **remainingMinutes=0과 미지정이 구분되지 않았다.** attribute 존재 여부로 가른다
 *     (jd-badge count 선례) — "약 0분 남음"은 값이 실제로 0일 때만 나온다.
 *  2. **진행 바에 valuetext가 없었다.** valuemin/max/now에 더해 aria-valuetext("28%")로
 *     읽는 값을 못 박는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import readingProgressStyles from "./reading-progress.css.js";

const CLS = "jd-reading-progress";

export class JdReadingProgress extends JdElement {
  static override tag = "jd-reading-progress";
  static override props = {
    currentPage: { type: Number, default: 0 }, // attr: current-page
    totalPages: { type: Number, default: 0 }, // attr: total-pages
    chapter: { type: String },
    remainingMinutes: { type: Number, default: 0 }, // attr: remaining-minutes
    compact: { type: Boolean, reflect: true },
  };

  declare currentPage: number;
  declare totalPages: number;
  declare chapter: string;
  declare remainingMinutes: number;
  declare compact: boolean;

  /** 어느 골격으로 지어졌는지 — 미결정 null */
  #builtCompact: boolean | null = null;
  #track!: HTMLElement;
  #fill!: HTMLElement;
  // full 전용
  #chapterEl: HTMLElement | null = null;
  #curEl: HTMLElement | null = null;
  #totalEl: HTMLElement | null = null;
  #donePct: HTMLElement | null = null;
  #remain: HTMLElement | null = null;
  // compact 전용
  #compactPct: HTMLElement | null = null;

  /** 0~100 clamp */
  get percent(): number {
    const total = Number(this.totalPages);
    const cur = Number(this.currentPage);
    if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(cur)) return 0;
    return Math.min(100, Math.max(0, (cur / total) * 100));
  }

  protected render(): void {
    adoptStyles(readingProgressStyles);
    this.#build(this.compact);
    this.update();
  }

  #build(compact: boolean): void {
    this.textContent = "";
    this.#chapterEl = this.#curEl = this.#totalEl = null;
    this.#donePct = this.#remain = this.#compactPct = null;

    this.#fill = document.createElement("div");
    this.#fill.className = `${CLS}__fill`;
    this.#track = document.createElement("div");
    this.#track.className = `${CLS}__track`;
    this.#track.setAttribute("role", "progressbar");
    this.#track.setAttribute("aria-valuemin", "0");
    this.#track.setAttribute("aria-valuemax", "100");
    this.#track.setAttribute("aria-label", "독서 진행률");
    this.#track.append(this.#fill);

    if (compact) {
      this.#compactPct = span(`${CLS}__compact-pct`);
      this.append(this.#track, this.#compactPct);
    } else {
      this.#chapterEl = document.createElement("p");
      this.#chapterEl.className = `${CLS}__chapter`;
      const count = document.createElement("p");
      count.className = `${CLS}__count`;
      this.#curEl = span(`${CLS}__cur`);
      const sep = span(`${CLS}__sep`);
      sep.textContent = "/";
      this.#totalEl = span(`${CLS}__total`);
      count.append(this.#curEl, sep, this.#totalEl);
      const head = document.createElement("div");
      head.className = `${CLS}__head`;
      head.append(this.#chapterEl, count);

      this.#donePct = span(`${CLS}__done`);
      this.#remain = span(`${CLS}__remain`);
      const foot = document.createElement("div");
      foot.className = `${CLS}__foot`;
      foot.append(this.#donePct, this.#remain);

      this.append(head, this.#track, foot);
    }
    this.#builtCompact = compact;
  }

  protected override update(): void {
    if (this.#builtCompact !== this.compact) this.#build(this.compact);

    const pct = this.percent;
    const rounded = Math.round(pct);
    this.#fill.style.width = `${pct}%`;
    this.#track.setAttribute("aria-valuenow", String(rounded));
    this.#track.setAttribute("aria-valuetext", `${rounded}%`);

    if (this.compact) {
      if (this.#compactPct) this.#compactPct.textContent = `${rounded}%`;
      return;
    }

    if (this.#chapterEl) this.#chapterEl.textContent = this.chapter || "독서 진행률";
    if (this.#curEl) this.#curEl.textContent = String(this.currentPage);
    if (this.#totalEl) this.#totalEl.textContent = String(this.totalPages);
    if (this.#donePct) this.#donePct.textContent = `${rounded}% 완료`;
    if (this.#remain) {
      // attribute 존재(명시 0 허용) 또는 양수 프로퍼티 — 미지정 0은 숨긴다(v2 undefined 대응)
      const has = this.hasAttribute("remaining-minutes") || Number(this.remainingMinutes) > 0;
      this.#remain.hidden = !has;
      if (has) this.#remain.textContent = `약 ${this.remainingMinutes}분 남음`;
    }
  }
}

function span(className: string): HTMLElement {
  const node = document.createElement("span");
  node.className = className;
  return node;
}
