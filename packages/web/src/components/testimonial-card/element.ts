/**
 * <jd-testimonial-card> — 사용자 후기 카드 (v2 composites/TestimonialCard).
 *
 * variant 3종(card·quote·minimal)은 v2에서 세 갈래 JSX였다. v3는 골격 1개 +
 * 호스트 속성 셀렉터로 통일한다(§4.3) — 별점·인용·작성자 블록은 항상 같은 순서로
 * 존재하고 배치만 CSS가 바꾼다. 인용은 `quote` attribute 또는 기본 슬롯(light DOM)
 * 어느 쪽이든 받는다. 회사 로고는 slot="logo".
 *
 * 접근성 개선: v2의 <div>를 <blockquote> + <cite>로 시맨틱화(모든 variant),
 * 별점 컨테이너에 role="img" + aria-label로 스크린리더 단일 읽기.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import testimonialCardStyles from "./testimonial-card.css.js";

const STAR = (filled: boolean): string =>
  `<svg class="jd-testimonial-card__star" width="14" height="14" viewBox="0 0 16 16" ` +
  `fill="${filled ? "#f59e0b" : "transparent"}" stroke="#f59e0b" stroke-width="1.5" aria-hidden="true">` +
  `<path d="M8 1l2.2 4.5 5 .7-3.6 3.5.85 5L8 12.3 3.55 14.7l.85-5L.8 6.2l5-.7z" stroke-linejoin="round"/></svg>`;

export class JdTestimonialCard extends JdElement {
  static override tag = "jd-testimonial-card";
  static override props = {
    variant: { type: String, default: "card", reflect: true }, // card | quote | minimal
    quote: { type: String },
    rating: { type: Number, attribute: "rating" }, // 존재 시에만 별점(0 유효값 회피는 hasAttribute로)
    authorName: { type: String }, // attr: author-name
    authorRole: { type: String },
    authorAvatar: { type: String },
    highlighted: { type: Boolean, reflect: true },
  };

  declare variant: string;
  declare quote: string;
  declare rating: number;
  declare authorName: string;
  declare authorRole: string;
  declare authorAvatar: string;
  declare highlighted: boolean;

  #stars!: HTMLDivElement;
  #quoteEl!: HTMLQuoteElement;
  #avatar!: HTMLDivElement;
  #nameEl!: HTMLElement;
  #roleEl!: HTMLElement;
  #lastRating = -1;
  #adoptedQuote = false;

  protected render(): void {
    adoptStyles(testimonialCardStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-testimonial-card__stars");
    if (existing) {
      this.#stars = existing as HTMLDivElement;
      this.#quoteEl = this.querySelector<HTMLQuoteElement>(".jd-testimonial-card__quote")!;
      this.#avatar = this.querySelector<HTMLDivElement>(".jd-testimonial-card__avatar")!;
      this.#nameEl = this.querySelector<HTMLElement>(".jd-testimonial-card__name")!;
      this.#roleEl = this.querySelector<HTMLElement>(".jd-testimonial-card__role")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    // 슬롯 로고 + 기본 슬롯(인용 본문) 분리
    const logo = this.querySelector(':scope > [slot="logo"]');
    const bodyNodes = Array.from(this.childNodes).filter((n) => n !== logo);

    this.#stars = document.createElement("div");
    this.#stars.className = "jd-testimonial-card__stars";
    this.#stars.setAttribute("role", "img");

    this.#quoteEl = document.createElement("blockquote");
    this.#quoteEl.className = "jd-testimonial-card__quote";
    // quote attribute가 없으면 기존 children을 인용 본문으로 입양
    if (!this.hasAttribute("quote") && bodyNodes.length) {
      this.#quoteEl.append(...bodyNodes);
      this.#adoptedQuote = true;
    }

    const author = document.createElement("footer");
    author.className = "jd-testimonial-card__author";
    this.#avatar = document.createElement("div");
    this.#avatar.className = "jd-testimonial-card__avatar";
    this.#avatar.setAttribute("aria-hidden", "true");
    const meta = document.createElement("div");
    meta.className = "jd-testimonial-card__meta";
    this.#nameEl = document.createElement("cite");
    this.#nameEl.className = "jd-testimonial-card__name";
    this.#roleEl = document.createElement("span");
    this.#roleEl.className = "jd-testimonial-card__role";
    meta.append(this.#nameEl, this.#roleEl);
    author.append(this.#avatar, meta);
    if (logo) {
      const logoWrap = document.createElement("div");
      logoWrap.className = "jd-testimonial-card__logo";
      logoWrap.append(logo);
      author.append(logoWrap);
    }

    this.append(this.#stars, this.#quoteEl, author);
  }

  #initials(name: string): string {
    return name
      .split(/\s+/)
      .map((p) => p[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  protected override update(): void {
    // 별점 — rating attribute가 존재할 때만
    const hasRating = this.hasAttribute("rating");
    this.#stars.hidden = !hasRating;
    if (hasRating) {
      const r = Math.max(0, Math.min(5, this.rating));
      if (r !== this.#lastRating) {
        this.#lastRating = r;
        this.#stars.innerHTML = [1, 2, 3, 4, 5].map((i) => STAR(i <= r)).join("");
        this.#stars.setAttribute("aria-label", `5점 만점에 ${r}점`);
      }
    }

    // 인용 — attribute 우선, 없으면 입양한 슬롯 본문 유지
    if (this.hasAttribute("quote")) this.#quoteEl.textContent = this.quote;
    this.#quoteEl.hidden = !this.hasAttribute("quote") && !this.#adoptedQuote;

    // 작성자
    const name = this.authorName;
    if (this.authorAvatar) {
      // url() 문자열 안전화 — 따옴표·역슬래시만 이스케이프(CSS.escape는 URL엔 과다 이스케이프)
      const safe = this.authorAvatar.replace(/["\\]/g, "\\$&");
      this.#avatar.dataset.image = "1";
      this.#avatar.style.backgroundImage = `url("${safe}")`;
      this.#avatar.textContent = "";
    } else {
      delete this.#avatar.dataset.image;
      this.#avatar.style.backgroundImage = "";
      this.#avatar.textContent = this.#initials(name);
    }
    this.#nameEl.textContent = name;
    this.#roleEl.textContent = this.authorRole;
    this.#roleEl.hidden = !this.authorRole;
  }
}
