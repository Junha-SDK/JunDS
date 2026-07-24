/**
 * <jd-photo-card> — 사진 + 캡션 + 좋아요/댓글 메타 (v2 composites/PhotoCard).
 *
 * 텍스트 프롭(caption·meta·badge)은 v2의 ReactNode 자리다. 노드를 attribute로 실을 수
 * 없으므로(§1.3) **문자열 프롭 + light DOM 슬롯 2경로**로 낸다(jd-image의
 * slot="placeholder" 선례 · DEC-014-4): `<span slot="badge"><jd-badge>…</jd-badge></span>`
 * 처럼 넣으면 그 노드가 자리를 차지하고, 없으면 문자열 프롭이 텍스트로 들어간다.
 *
 * v2 대비 교정 4건:
 *  1. **좋아요·댓글이 AT에 전달되지 않았다.** v2는 맨 `<span aria-label="좋아요 142">❤ 142</span>`
 *     였는데, 역할 없는 span은 author name을 받지 못해(ARIA "name from author" 미허용
 *     역할) 스크린리더는 "하트 142"만 읽거나 아무것도 읽지 않았다. v3는 이모지를
 *     aria-hidden으로 빼고 라벨을 **시각적으로만 감춘 실제 텍스트**로 넣는다 —
 *     화면에는 "❤ 142", AT에는 "좋아요 142".
 *  2. **호버 전용 피드백**: v2 interactive는 `hover:` 뿐이라 키보드 사용자에게는 아무
 *     변화가 없었다. :focus-within을 같은 규칙에 합류시킨다(jd-card 선례).
 *  3. **캡션 프롭 이름**: v2 `title`은 CE에서 호스트 attribute가 되면 브라우저 기본
 *     툴팁까지 띄운다(jd-descriptions가 남긴 함정). 여기서는 `caption`으로 낸다 —
 *     실제로도 `<figcaption>`이고, jd-photo-lightbox·jd-photo-carousel의 photo.caption과
 *     이름이 맞는다. (react 어댑터가 title → caption 다리를 놓는다.)
 *  4. **감속 선호 존중**: 상승 이동은 prefers-reduced-motion에서 뺀다(CSS).
 *
 * aspect-ratio는 인라인 style이 아니라 호스트 커스텀 프로퍼티로 낸다 — 인라인이면
 * 소비자 미디어 규칙이 이길 수 없다(jd-descriptions --jd-desc-span 선례).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import photoCardStyles from "./photo-card.css.js";

/** 유한한 숫자일 때만 값으로 인정 — NaN 기본값이 "미표시"다(jd-file-upload maxSize 선례) */
function numOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * 천 단위 구분 — `toLocaleString()` 대신 결정적 치환을 쓴다.
 * 프리렌더(헤드리스 Chrome)와 방문자 브라우저의 기본 로케일이 다르면 같은 데이터가
 * 다른 문자열이 된다(§3.1-3 결정적 렌더 규칙의 정신). 정수 카운트에는 로케일이 필요없다.
 */
function groupDigits(n: number): string {
  return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export class JdPhotoCard extends JdElement {
  static override tag = "jd-photo-card";
  static override props = {
    src: { type: String },
    alt: { type: String },
    /** 캡션 (v2 title) */
    caption: { type: String },
    /** 부가 정보 — 위치·날짜 등 */
    meta: { type: String },
    /** 좋아요 수. 기본 NaN = 미표시 */
    likes: { type: Number, default: NaN },
    /** 댓글 수. 기본 NaN = 미표시 */
    comments: { type: Number, default: NaN },
    /** CSS aspect-ratio 값 (v2 aspectRatio, 기본 "4 / 5") */
    ratio: { type: String, default: "4 / 5" },
    /** 호버·포커스 시 살짝 떠오름 */
    interactive: { type: Boolean, reflect: true },
    /** 우상단 배지 텍스트 */
    badge: { type: String },
    /** 네이티브 지연 로딩 — v2 고정 lazy를 프롭으로 연다 */
    loading: { type: String, default: "lazy" },
    likesLabel: { type: String, default: "좋아요" },
    commentsLabel: { type: String, default: "댓글" },
  };

  declare src: string;
  declare alt: string;
  declare caption: string;
  declare meta: string;
  declare likes: number;
  declare comments: number;
  declare ratio: string;
  declare interactive: boolean;
  declare badge: string;
  declare loading: string;
  declare likesLabel: string;
  declare commentsLabel: string;

  #figure!: HTMLElement;
  #img!: HTMLImageElement;
  #badge!: HTMLElement;
  #caption!: HTMLElement;
  #captionText!: HTMLElement;
  #metaText!: HTMLElement;
  #stats!: HTMLElement;
  #likes!: HTMLElement;
  #comments!: HTMLElement;

  protected render(): void {
    adoptStyles(photoCardStyles);
    // 입양(§3.3): SSR/어댑터가 그린 골격이 있으면 재사용한다
    const existing = this.querySelector<HTMLElement>(":scope > figure.jd-photo-card__figure");
    this.#figure = existing ?? this.#build();
    this.#img = this.#figure.querySelector(".jd-photo-card__img")!;
    this.#badge = this.#figure.querySelector(".jd-photo-card__badge")!;
    this.#caption = this.#figure.querySelector(".jd-photo-card__caption")!;
    this.#captionText = this.#figure.querySelector(".jd-photo-card__text")!;
    this.#metaText = this.#figure.querySelector(".jd-photo-card__meta")!;
    this.#stats = this.#figure.querySelector(".jd-photo-card__stats")!;
    this.#likes = this.#figure.querySelector('[data-stat="likes"]')!;
    this.#comments = this.#figure.querySelector('[data-stat="comments"]')!;
    this.#fillSlots();
    this.update();
  }

  #build(): HTMLElement {
    const figure = document.createElement("figure");
    figure.className = "jd-photo-card__figure";

    const frame = document.createElement("div");
    frame.className = "jd-photo-card__frame";
    const img = document.createElement("img");
    img.className = "jd-photo-card__img";
    img.decoding = "async";
    const badge = document.createElement("span");
    badge.className = "jd-photo-card__badge";
    frame.append(img, badge);

    const caption = document.createElement("figcaption");
    caption.className = "jd-photo-card__caption";
    const text = document.createElement("p");
    text.className = "jd-photo-card__text";
    const meta = document.createElement("p");
    meta.className = "jd-photo-card__meta";
    const stats = document.createElement("div");
    stats.className = "jd-photo-card__stats";
    stats.append(this.#buildStat("likes", "❤"), this.#buildStat("comments", "💬"));
    caption.append(text, meta, stats);

    figure.append(frame, caption);
    this.append(figure);
    return figure;
  }

  /** 이모지는 장식(aria-hidden), 이름은 시각적으로만 감춘 실제 텍스트가 준다 */
  #buildStat(kind: string, glyph: string): HTMLElement {
    const stat = document.createElement("span");
    stat.className = "jd-photo-card__stat";
    stat.dataset.stat = kind;
    const icon = document.createElement("span");
    icon.className = "jd-photo-card__stat-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = glyph;
    const name = document.createElement("span");
    name.className = "jd-photo-card__sr";
    const value = document.createElement("span");
    value.className = "jd-photo-card__stat-value";
    stat.append(icon, name, value);
    return stat;
  }

  /**
   * light DOM 슬롯 수용 — `slot="badge" | "caption" | "meta"`인 직계 자식을 자리로 옮긴다.
   * 1회성이다: 옮기고 나면 `:scope > [slot]`에 남는 것이 없어 재렌더에서 멱등하다(§3.3).
   */
  #fillSlots(): void {
    const move = (name: string, target: HTMLElement): void => {
      const nodes = this.querySelectorAll<HTMLElement>(`:scope > [slot="${name}"]`);
      if (nodes.length === 0) return;
      target.textContent = "";
      target.append(...nodes);
      target.dataset.slotted = "";
    };
    move("badge", this.#badge);
    move("caption", this.#captionText);
    move("meta", this.#metaText);
  }

  protected override update(): void {
    this.style.setProperty("--jd-photo-card-ratio", this.ratio);

    const img = this.#img;
    if (this.src) img.src = this.src;
    else img.removeAttribute("src");
    img.alt = this.alt;
    img.loading = this.loading === "eager" ? "eager" : "lazy";

    const slottedBadge = this.#badge.dataset.slotted !== undefined;
    if (!slottedBadge) this.#badge.textContent = this.badge;
    this.#badge.hidden = !slottedBadge && !this.badge;

    const slottedCaption = this.#captionText.dataset.slotted !== undefined;
    if (!slottedCaption) this.#captionText.textContent = this.caption;
    this.#captionText.hidden = !slottedCaption && !this.caption;

    const slottedMeta = this.#metaText.dataset.slotted !== undefined;
    if (!slottedMeta) this.#metaText.textContent = this.meta;
    this.#metaText.hidden = !slottedMeta && !this.meta;

    const likes = numOrNull(this.likes);
    const comments = numOrNull(this.comments);
    this.#fillStat(this.#likes, this.likesLabel, likes);
    this.#fillStat(this.#comments, this.commentsLabel, comments);
    this.#stats.hidden = likes === null && comments === null;

    this.#caption.hidden =
      this.#captionText.hidden && this.#metaText.hidden && this.#stats.hidden;
  }

  #fillStat(el: HTMLElement, label: string, value: number | null): void {
    el.hidden = value === null;
    if (value === null) return;
    el.querySelector(".jd-photo-card__sr")!.textContent = `${label} `;
    el.querySelector(".jd-photo-card__stat-value")!.textContent = groupDigits(value);
  }
}
