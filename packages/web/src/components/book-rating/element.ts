/**
 * <jd-book-rating> — 책 평점: 평균 + 별 + (선택) 점수 분포 막대 (v2 composites/BookRating).
 *
 * 소수 평점(4.3)은 4번째 별을 clip-path로 30%만 채워 표시한다(v2 동형 — 별마다
 * 회색 바탕 svg 위에 금색 svg를 inset clip). 별 채움은 렌더가 아니라 update()의
 * 인라인 clip 갱신으로만 바뀐다 — 노드 교체 없음(§3.1-3 결정적 렌더).
 *
 * distribution(점수 분포)은 복합 데이터라 property(number[]) 또는 자식
 * `<script type="application/json">` 슬롯으로 받는다(§1.3). reviews는 attribute
 * 존재로 노출을 판정한다(badge count 선례) — 0개 리뷰와 "리뷰 정보 없음"을 구분.
 *
 * v2 대비 개선: 별 묶음은 이미 aria-hidden이고 호스트 aria-label이 평점을 문장으로
 * 읽어준다 — 분포 막대에도 각 행에 aria-label을 붙여 스크린리더가 "5점 1,060개"를
 * 얻게 한다(v2 막대는 시각 전용이었다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import bookRatingStyles from "./book-rating.css.js";

const NS = "http://www.w3.org/2000/svg";
/** v2 BookRating 별 path (viewBox 0 0 20 20) */
const STAR_PATH = "M10 1.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L10 14.7 4.8 17.5l1-5.8L1.5 7.6l5.9-.8z";

function makeStarSvg(cls: string): SVGSVGElement {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", cls);
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", STAR_PATH);
  svg.append(path);
  return svg;
}

export class JdBookRating extends JdElement {
  static override tag = "jd-book-rating";
  static override props = {
    /** 평균 평점 */
    value: { type: Number, default: 0 },
    /** 만점 */
    max: { type: Number, default: 5 },
    /** 리뷰 수 — attribute 존재 시에만 노출(0 리뷰와 정보 없음 구분) */
    reviews: { type: Number, reflect: true },
    /** 분포 막대를 감추고 요약 한 줄만 */
    compact: { type: Boolean, reflect: true },
    // distribution(number[])은 property 전용(§1.3)
  };

  declare value: number;
  declare max: number;
  declare reviews: number;
  declare compact: boolean;

  #distribution: number[] = [];

  #summary!: HTMLElement;
  #value!: HTMLElement;
  #starWrap!: HTMLElement;
  #reviews!: HTMLElement;
  #dist!: HTMLElement;
  #fills: SVGSVGElement[] = [];

  get distribution(): number[] {
    return this.#distribution;
  }
  set distribution(v: number[]) {
    this.#distribution = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(bookRatingStyles);
    this.#readJson();
    const existing = this.querySelector<HTMLElement>(":scope > .jd-book-rating__summary");
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
      const parsed = JSON.parse(script.textContent || "[]") as number[];
      if (Array.isArray(parsed)) this.#distribution = parsed.map(Number);
    } catch {
      console.warn("[junds] <jd-book-rating> distribution JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #adopt(summary: HTMLElement): void {
    this.#summary = summary;
    this.#value = summary.querySelector(".jd-book-rating__value")!;
    this.#starWrap = summary.querySelector(".jd-book-rating__stars")!;
    this.#reviews = summary.querySelector(".jd-book-rating__reviews")!;
    this.#dist = this.querySelector(".jd-book-rating__dist")!;
    this.#fills = Array.from(this.#starWrap.querySelectorAll(".jd-book-rating__star-fill"));
  }

  #build(): void {
    this.#summary = document.createElement("div");
    this.#summary.className = "jd-book-rating__summary";

    this.#value = document.createElement("span");
    this.#value.className = "jd-book-rating__value";

    this.#starWrap = document.createElement("span");
    this.#starWrap.className = "jd-book-rating__stars";
    this.#starWrap.setAttribute("aria-hidden", "true");

    this.#reviews = document.createElement("span");
    this.#reviews.className = "jd-book-rating__reviews";

    this.#summary.append(this.#value, this.#starWrap, this.#reviews);

    this.#dist = document.createElement("div");
    this.#dist.className = "jd-book-rating__dist";

    this.append(this.#summary, this.#dist);
    this.#buildStars();
  }

  /** max개 별 골격 — 채움은 update()의 clip으로만 갱신 */
  #buildStars(): void {
    this.#starWrap.textContent = "";
    this.#fills = [];
    for (let i = 0; i < this.max; i++) {
      const star = document.createElement("span");
      star.className = "jd-book-rating__star";
      const base = makeStarSvg("jd-book-rating__star-base");
      const fill = makeStarSvg("jd-book-rating__star-fill");
      star.append(base, fill);
      this.#starWrap.append(star);
      this.#fills.push(fill);
    }
  }

  protected override update(): void {
    if (this.#fills.length !== this.max) this.#buildStars();

    // 평균값
    this.#value.textContent = this.value.toFixed(1);

    // 별 채움 (소수 → clip-path inset)
    const full = Math.floor(this.value);
    const partial = this.value - full;
    for (let i = 0; i < this.#fills.length; i++) {
      const fillRatio = i < full ? 1 : i === full ? partial : 0;
      this.#fills[i]!.style.clipPath = `inset(0 ${(1 - fillRatio) * 100}% 0 0)`;
    }

    // 리뷰 수 — attribute 존재 시에만
    const hasReviews = this.hasAttribute("reviews");
    this.#reviews.hidden = !hasReviews;
    if (hasReviews) this.#reviews.textContent = `(${this.reviews.toLocaleString()})`;

    // 호스트 접근 이름 (v2 동형)
    const reviewCount = hasReviews ? this.reviews : 0;
    this.setAttribute("aria-label", `${this.value}점, 총 ${reviewCount}개 리뷰`);

    this.#syncDist();
  }

  #syncDist(): void {
    const dist = this.#distribution;
    const total = dist.reduce((s, n) => s + n, 0);
    const show = !this.compact && dist.length === this.max && total > 0;
    this.#dist.hidden = !show;
    if (!show) {
      this.#dist.textContent = "";
      return;
    }
    // 상단이 만점 — 역순
    const reversed = [...dist].reverse();
    if (this.#dist.children.length !== reversed.length) {
      this.#dist.textContent = "";
      for (let idx = 0; idx < reversed.length; idx++) {
        const score = this.max - idx;
        const row = document.createElement("div");
        row.className = "jd-book-rating__row";
        const scoreEl = document.createElement("span");
        scoreEl.className = "jd-book-rating__score";
        scoreEl.textContent = `${score}점`;
        const track = document.createElement("div");
        track.className = "jd-book-rating__track";
        const bar = document.createElement("div");
        bar.className = "jd-book-rating__bar";
        track.append(bar);
        const count = document.createElement("span");
        count.className = "jd-book-rating__count";
        row.append(scoreEl, track, count);
        this.#dist.append(row);
      }
    }
    reversed.forEach((count, idx) => {
      const score = this.max - idx;
      const pct = (count / total) * 100;
      const row = this.#dist.children[idx] as HTMLElement;
      const bar = row.querySelector<HTMLElement>(".jd-book-rating__bar")!;
      bar.style.width = `${pct}%`;
      row.querySelector<HTMLElement>(".jd-book-rating__count")!.textContent =
        count.toLocaleString();
      row.setAttribute("aria-label", `${score}점 ${count.toLocaleString()}개`);
    });
  }
}
