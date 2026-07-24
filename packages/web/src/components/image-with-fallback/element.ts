/**
 * <jd-image-with-fallback> — 스켈레톤 + 대체 주소를 아는 이미지
 * (v2 composites/ImageWithFallback) = **<jd-image> 파생**(§6 R12).
 *
 * v2는 primitives/Image와 이 합성이 각자 로딩·실패 상태를 다시 구현했다(상태 이름도
 * 달랐다). v3는 상태 기계·이벤트·img 골격·캐시 히트 보정을 전부 jd-image가 갖고,
 * 파생은 **v2가 더 갖고 있던 세 가지**만 얹는다 — 로딩 스켈레톤, 실패 시 갈아 끼울
 * 두 번째 주소, 마지막 자리표시자. jd-drawer가 jd-modal에서 패널 기하만 재정의하는
 * 것과 같은 관계다.
 *
 * v2 대비 실질 개선 6건:
 *  1. **대체 주소도 실패하면 자리표시자가 뜬다.** v2는 `fallbackSrc`가 있으면
 *     "이미지 없음" 자리표시자를 아예 렌더하지 않았다 — 대체 주소마저 깨지면
 *     빈 회색 상자만 남았다(실패가 화면에 아무 흔적도 남기지 않는다).
 *     v3는 주소를 다 소진하면 자리표시자로 떨어진다.
 *  2. **되감기가 있다.** v2는 한 번 error가 되면 src를 바꿔도 status가 그대로라
 *     새 주소가 절대 로드되지 않았다(useState 초기값 1회). v3는 src가 바뀌면
 *     폴백 이력을 버리고 처음부터 다시 시도한다.
 *  3. **자리표시자에 이름이 있다.** v2 자리표시자는 그냥 텍스트 div라 실패한 이미지의
 *     `alt`가 접근성 트리에서 통째로 증발했다. v3는 alt가 있으면 자리표시자가
 *     role="img" + aria-label=alt로 그 이름을 이어받고, alt가 비면(장식 이미지)
 *     aria-hidden으로 조용히 남는다 — jd-image의 fallback 슬롯 규약과 동형.
 *  4. **실패가 관측 가능하다.** jd-load / jd-error(기반 클래스)에 더해 주소를 갈아
 *     끼우는 순간 `jd-fallback`을 낸다 — 로깅·계측이 붙을 자리가 생긴다.
 *  5. **src가 비어도 대체 주소가 쓰인다.** v2는 `finalSrc`를 "error && fallbackSrc"
 *     로만 계산해, src가 undefined인 흔한 경우(`src={item.url}`)에는 img 자체를
 *     렌더하지 않아 대체 주소가 있어도 빈 회색 상자로 끝났다.
 *  6. **다크에서 스켈레톤이 본문보다 밝지 않다.** v2는 gray-100/200 고정에
 *     dark: 변형을 손으로 붙였다. v3는 jd-skeleton의 `.jd-skeleton-block`을 채택해
 *     색·박자·감속 선호를 한 곳(skeleton.css)에서 받는다 — jd-skeleton-preset 선례.
 *
 * 표면 주의: v2 기본값이 true인 `showSkeleton`은 attribute로 끌 수 없어(존재=값, §1.3)
 * 반전 플래그 `no-skeleton`으로 낸다(DEC-029-5 · jd-carousel hide-dots 선례).
 * v2 `aspectRatio`(기본 "1/1")는 기반 클래스의 `ratio` 프롭에 기본값만 얹어 흡수했다 —
 * 같은 뜻의 프롭을 두 이름으로 내지 않는다.
 */
import { JdImage } from "../image/element.js";
import { adoptStyles } from "../../core/styles.js";
import skeletonStyles from "../skeleton/skeleton.css.js";
import imageWithFallbackStyles from "./image-with-fallback.css.js";

const CLS = "jd-image-with-fallback";

/** v2의 🖼 이모지 자리 — 폰트에 좌우되지 않는 자체 드로잉(§7.2 문법: stroke·currentColor) */
const EMPTY_SVG =
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true" focusable="false">` +
  `<rect x="3" y="4.5" width="18" height="15" rx="2"/>` +
  `<circle cx="8.75" cy="9.75" r="1.25"/>` +
  `<path d="M3.5 16.75l4.25-3.75 3.25 2.75 3.75-3.75 5.75 5.25"/></svg>`;

export class JdImageWithFallback extends JdImage {
  static override tag = "jd-image-with-fallback";
  static override props = {
    ...JdImage.props,
    /** v2 aspectRatio 기본 "1/1" — 기반 클래스는 무지정이 기본이다 */
    ratio: { type: String, default: "1/1" },
    /** 1차 주소가 실패하면 갈아 끼울 주소. 비면 곧장 자리표시자로 간다 */
    fallbackSrc: { type: String }, // attr: fallback-src
    /** v2 showSkeleton=true의 반전 플래그 */
    noSkeleton: { type: Boolean, reflect: true }, // attr: no-skeleton
    /** 주소를 다 소진했을 때의 자리표시자 문구 */
    emptyText: { type: String, default: "이미지 없음" }, // attr: empty-text
  };

  declare fallbackSrc: string;
  declare noSkeleton: boolean;
  declare emptyText: string;

  #skeleton: HTMLElement | null = null;
  #empty: HTMLElement | null = null;
  #emptyLabel: HTMLElement | null = null;
  /** 지금 img에 실린 것이 fallbackSrc인가 */
  #fellBack = false;
  /** src 교체를 감지해 폴백 이력을 버리기 위한 직전 값 */
  #lastSrc: string | null = null;

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected override render(): void {
    // img 골격 구축·입양 + image.css 채택 + status 초기화까지 기반 클래스가 한다.
    // (이 안에서 this.update()가 한 번 불린다 — 아래 노드들은 아직 null이므로
    //  update()는 항상 null 안전해야 한다.)
    super.render();
    adoptStyles(skeletonStyles); // 반짝임의 단일 출처
    adoptStyles(imageWithFallbackStyles);
    this.#mountSkeleton();
    this.#mountEmpty();
    this.update();
  }

  #mountSkeleton(): void {
    const existing = this.querySelector<HTMLElement>(`:scope > .${CLS}__skeleton`);
    if (existing) {
      this.#skeleton = existing;
      return;
    }
    const el = this.ownerDocument.createElement("span");
    // 색·박자·다크·감속 선호는 .jd-skeleton-block이 준다(§6 R12)
    el.className = `jd-skeleton-block ${CLS}__skeleton`;
    el.setAttribute("aria-hidden", "true");
    this.append(el);
    this.#skeleton = el;
  }

  #mountEmpty(): void {
    const existing = this.querySelector<HTMLElement>(`:scope > .${CLS}__empty`);
    if (existing) {
      this.#empty = existing;
      this.#emptyLabel = existing.querySelector<HTMLElement>(`.${CLS}__empty-text`);
      return;
    }
    const doc = this.ownerDocument;
    const el = doc.createElement("div");
    el.className = `${CLS}__empty`;
    const icon = doc.createElement("span");
    icon.className = `${CLS}__empty-icon`;
    icon.innerHTML = EMPTY_SVG;
    const text = doc.createElement("span");
    text.className = `${CLS}__empty-text`;
    el.append(icon, text);
    this.append(el);
    this.#empty = el;
    this.#emptyLabel = text;
  }

  /* ── 수명 ─────────────────────────────────────────────────────────── */

  protected override connected(): void {
    super.connected(); // img load/error 리스너 + 캐시 히트 보정
    // 기반 클래스가 낸 실패 통지를 듣고 두 번째 주소로 갈아탄다.
    // img의 error를 다시 듣지 않는 이유: 상태 판정은 한 곳(jd-image)에만 둔다.
    this.addEventListener("jd-error", this.#onFailure);
  }

  protected override disconnected(): void {
    super.disconnected();
    this.removeEventListener("jd-error", this.#onFailure);
  }

  #onFailure = (e: Event): void => {
    if (e.target !== this) return; // 중첩된 다른 이미지의 실패는 내 일이 아니다
    if (this.#fellBack) return; // 대체 주소마저 실패 — 자리표시자로 끝낸다
    const next = this.fallbackSrc;
    // 같은 주소로 갈아타면 로드가 다시 일어나지 않아 영원히 "loading"이 된다
    if (!next || next === this.src) return;
    this.#fellBack = true;
    this.status = "loading"; // → update()가 img.src를 갈아 끼운다
    this.emit("jd-fallback", { src: this.src, fallbackSrc: next });
  };

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  /**
   * 기반 클래스의 update()를 부르지 않는다: 저쪽은 img.src를 항상 `this.src`로
   * 되돌리는데, 여기서는 "지금 실어야 할 주소"가 폴백일 수 있어 둘이 서로를
   * 덮어쓰며 무한히 돈다. 대신 같은 일을 폴백을 아는 형태로 다시 쓴다.
   */
  protected override update(): void {
    const img = this.querySelector<HTMLImageElement>(":scope > img.jd-image__img");
    if (!img) return;

    // src 교체 = 새 시도. 폴백 이력을 버린다(v2는 여기서 영영 멈췄다)
    if (this.src !== this.#lastSrc) {
      this.#lastSrc = this.src;
      this.#fellBack = false;
    }
    // 1차 주소가 아예 없으면 기다릴 것이 없다 — 곧장 대체 주소로 간다
    if (!this.src && this.fallbackSrc) this.#fellBack = true;

    const want = this.#fellBack ? this.fallbackSrc : this.src;
    if (img.getAttribute("src") !== want) {
      if (want) {
        img.src = want;
        if (this.status !== "loading") this.status = "loading";
      } else {
        img.removeAttribute("src");
        if (this.status !== "error") this.status = "error";
      }
    }

    img.alt = this.alt; // 장식 이미지는 빈 문자열이 정답 — 기본값이 ""
    if (this.loading) img.setAttribute("loading", this.loading);
    else img.removeAttribute("loading");

    if (this.ratio) this.style.setProperty("aspect-ratio", this.ratio);
    else this.style.removeProperty("aspect-ratio");

    // 소비자가 준 슬롯이 내장 자리표시자를 이긴다(jd-image 규약 계승)
    const slotPlaceholder = this.querySelector<HTMLElement>(':scope > [slot="placeholder"]');
    const slotFallback = this.querySelector<HTMLElement>(':scope > [slot="fallback"]');
    if (slotFallback) {
      slotFallback.setAttribute("role", "img");
      slotFallback.setAttribute("aria-label", this.alt);
    }
    if (this.#skeleton) this.#skeleton.hidden = Boolean(slotPlaceholder);
    if (this.#empty && this.#emptyLabel) {
      this.#empty.hidden = Boolean(slotFallback);
      this.#emptyLabel.textContent = this.emptyText;
      // 실패한 이미지의 이름은 자리표시자가 이어받는다. 장식(alt="")이면 조용히 남는다
      if (this.alt) {
        this.#empty.setAttribute("role", "img");
        this.#empty.setAttribute("aria-label", this.alt);
        this.#empty.removeAttribute("aria-hidden");
      } else {
        this.#empty.setAttribute("aria-hidden", "true");
        this.#empty.removeAttribute("role");
        this.#empty.removeAttribute("aria-label");
      }
    }
  }
}
