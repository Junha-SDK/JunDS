/**
 * <jd-photo-carousel> — 사진 슬라이드쇼 (v2 composites/PhotoCarousel) = **jd-carousel 파생**.
 *
 * 같은 패키지에 캐러셀 엔진을 두 벌 두지 않는다(§6 R12). 기반이 이미 갖고 있는 것:
 * 자동재생 정지(호버·포커스·문서 hidden·prefers-reduced-motion, WCAG 2.2.2), 도트
 * (aria-current), 화살표, 사용자 스와이프↔인덱스 동기화, 트랙만 스크롤(조상 안 끌림).
 * 파생이 더하는 것은 **데이터 슬라이드(사진 배열)·종횡비·캡션 오버레이·검은 무대**뿐이다.
 *
 * 전환 방식은 기반을 따른다 — v2의 절대배치 크로스페이드 대신 scroll-snap 트랙이다.
 * 그 대가로 **터치 스와이프**가 생기고, 비활성 슬라이드를 `aria-hidden`으로 덮어
 * 감추던(포커스 가능한 내용이 들어가면 사고가 나는) 구조가 사라진다.
 *
 * 표면 매핑(v2 → v3):
 *  - `autoPlayMs={4000}` → `auto-play-ms="4000"` (0=꺼짐). 기반의 autoPlay/interval로 번역.
 *  - `showIndicators={false}` → `hide-dots` (Boolean은 부재가 기본값 §1.3 — jd-carousel 선례).
 *  - `aspectRatio` → `ratio` (jd-image·jd-photo-card와 같은 이름).
 *
 * 사진 입력 2경로(§1.3): `photos` 프로퍼티 또는 자식 `<script type="application/json">`.
 */
import { JdCarousel } from "../carousel/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createKeyHandler } from "../../behaviors/input.js";
import photoCarouselStyles from "./photo-carousel.css.js";

export interface JdCarouselPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export class JdPhotoCarousel extends JdCarousel {
  static override tag = "jd-photo-carousel";
  static override props = {
    ...JdCarousel.props,
    /** 자동재생 간격(ms). 0 = 꺼짐 (v2 autoPlayMs) */
    autoPlayMs: { type: Number, default: 0 },
    /** CSS aspect-ratio 값 (v2 aspectRatio, 기본 "16 / 9") */
    ratio: { type: String, default: "16 / 9" },
    label: { type: String, default: "사진 슬라이드쇼" },
    prevLabel: { type: String, default: "이전 사진" },
    nextLabel: { type: String, default: "다음 사진" },
  };

  declare autoPlayMs: number;
  declare ratio: string;

  #photos: JdCarouselPhoto[] = [];
  /** 마지막으로 골격에 반영한 배열 — 동기화 1회 판정(jd-descriptions 선례) */
  #built: readonly JdCarouselPhoto[] | null = null;

  get photos(): JdCarouselPhoto[] {
    return this.#photos;
  }
  set photos(v: JdCarouselPhoto[]) {
    this.#photos = Array.isArray(v) ? v : [];
    this.#built = null;
    this.requestUpdate();
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected override render(): void {
    this.#readJson(); // 기반이 children을 슬라이드로 감싸기 전에 소비한다
    super.render(); // 트랙·화살표·도트 + update() 1회
    adoptStyles(photoCarouselStyles);
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdCarouselPhoto[];
      if (Array.isArray(parsed)) this.#photos = parsed;
    } catch {
      console.warn("[junds] <jd-photo-carousel> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 슬라이드 골격 구축·데이터 반영. 개수가 같으면 만들지 않고 내용만 맞춘다(§3.3) */
  #syncSlides(): void {
    const track = this.querySelector<HTMLElement>(":scope > .jd-carousel__track");
    if (!track) return;
    this.#built = this.#photos;
    let slides = this.slides;
    if (slides.length !== this.#photos.length) {
      for (const s of slides) s.remove();
      for (let i = 0; i < this.#photos.length; i++) track.append(this.#createSlide());
      slides = this.slides;
    }
    slides.forEach((slide, i) => {
      const photo = this.#photos[i];
      if (!photo) return;
      const img = slide.querySelector<HTMLImageElement>(".jd-photo-carousel__img")!;
      if (photo.src) img.src = photo.src;
      else img.removeAttribute("src");
      img.alt = photo.alt ?? "";
      const cap = slide.querySelector<HTMLElement>(".jd-photo-carousel__caption")!;
      cap.textContent = photo.caption ?? "";
      cap.hidden = !photo.caption;
    });
  }

  /** 기반의 #adoptSlides가 붙이는 것과 같은 역할·이름을 직접 붙인다 */
  #createSlide(): HTMLElement {
    const slide = document.createElement("div");
    slide.className = "jd-carousel__slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    const figure = document.createElement("figure");
    figure.className = "jd-photo-carousel__figure";
    const img = document.createElement("img");
    img.className = "jd-photo-carousel__img";
    img.decoding = "async";
    img.loading = "lazy";
    const cap = document.createElement("figcaption");
    cap.className = "jd-photo-carousel__caption";
    figure.append(img, cap);
    slide.append(figure);
    return slide;
  }

  protected override connected(): void {
    super.connected();
    // v2는 호스트에 tabIndex=0 + onKeyDown이었다 — 탭 스톱을 늘리지 않고 안쪽에서
    // 올라오는 키를 받는다(화살표 버튼·스크롤 트랙 어디에 포커스가 있어도 동작).
    this.own(
      createKeyHandler(this, {
        ArrowLeft: () => this.prev(),
        ArrowRight: () => this.next(),
      }),
    );
  }

  /* ── 반영 ────────────────────────────────────────────────── */

  protected override update(): void {
    if (this.#built !== this.#photos) this.#syncSlides();
    this.style.setProperty("--jd-photo-carousel-ratio", this.ratio);

    // v2 autoPlayMs(0=꺼짐)를 기반의 autoPlay/interval로 번역.
    // **반드시 값이 다를 때만** 대입한다 — update()에서 무조건 쓰면 requestUpdate가
    // 자기 자신을 영원히 재예약한다.
    const ms = Math.max(0, Math.round(this.autoPlayMs));
    const wantAuto = ms > 0;
    if (this.autoPlay !== wantAuto) this.autoPlay = wantAuto;
    if (wantAuto && this.interval !== ms) this.interval = ms;

    // photos가 줄어 인덱스가 범위 밖이면 0으로 되돌린다 (v2 useEffect 클램프 이식)
    const count = this.count;
    if (count > 0 && this.index >= count) this.index = 0;
    this.toggleAttribute("data-empty", count === 0); // v2: total===0이면 아무것도 렌더하지 않았다

    super.update();
  }
}
