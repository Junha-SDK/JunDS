/**
 * <jd-carousel> — CSS scroll-snap 기반 슬라이더 (v2 composites/Carousel).
 *
 * 슬라이드는 **children**이다 — 호스트의 자식 요소 하나가 슬라이드 하나가 되고,
 * render()가 트랙 안 `.jd-carousel__slide`로 감싼다(입양 규칙 §3.3: 이미 감싸져
 * 있으면 다시 감싸지 않는다).
 *
 * v2 대비 교정 6건:
 *  1. **scrollIntoView가 페이지를 끌고 다녔다.** v2는 슬라이드마다 scrollIntoView를
 *     불러 조상 스크롤 컨테이너(=문서)까지 함께 움직였다 — 페이지 중간의 캐러셀이
 *     자동재생을 시작하면 화면이 제멋대로 튄다. v3는 트랙만 `scrollTo`한다.
 *  2. **사용자 스와이프와 도트가 어긋났다.** v2 current는 버튼 클릭으로만 바뀌었다 —
 *     v3는 트랙 스크롤을 읽어 현재 인덱스를 되맞춘다.
 *  3. **자동재생이 멈추지 않았다.** 포인터가 올라가 있거나 포커스가 안에 있어도,
 *     심지어 탭이 백그라운드여도 계속 돌았다. v3는 hover·focus-within·문서 hidden에서
 *     멈춘다(WCAG 2.2.2 정지 수단 + 배터리).
 *  4. **감속 선호를 무시했다.** `prefers-reduced-motion`이면 부드러운 스크롤 대신
 *     즉시 이동하고 자동재생을 시작하지 않는다.
 *  5. **캐러셀에 이름·역할이 없었다.** APG 캐러셀 패턴대로 `role="group"` +
 *     `aria-roledescription="carousel"`, 슬라이드마다 "N / 전체"를 준다.
 *  6. **도트가 현재 위치를 알리지 않았다.** `aria-current`를 붙인다.
 *
 * Boolean attribute는 **존재 여부가 값**이라(§1.3) v2의 기본 true 프롭
 * (showDots·showArrows·loop)은 `hide-dots`·`hide-arrows`·`no-loop`로 뒤집었다
 * (jd-clock hideSeconds·jd-code-editor hideLineNumbers 선례).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createInterval, type Timer } from "../../behaviors/timing.js";
import { createReducedMotionWatcher } from "../../behaviors/media.js";
import type { Watcher } from "../../behaviors/subscribe.js";
import carouselStyles from "./carousel.css.js";

const PREV_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
  `aria-hidden="true" focusable="false">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>`;
const NEXT_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
  `aria-hidden="true" focusable="false">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;

export class JdCarousel extends JdElement {
  static override tag = "jd-carousel";
  static override props = {
    /** 현재 슬라이드 (0-base) */
    index: { type: Number, default: 0, reflect: true },
    autoPlay: { type: Boolean, reflect: true }, // attr: auto-play
    /** 자동재생 간격(ms) — v2 기본 4000 */
    interval: { type: Number, default: 4000 },
    /** v2 showDots=true의 반전 */
    hideDots: { type: Boolean, reflect: true }, // attr: hide-dots
    /** v2 showArrows=true의 반전 */
    hideArrows: { type: Boolean, reflect: true }, // attr: hide-arrows
    /** v2 loop=true의 반전 */
    noLoop: { type: Boolean, reflect: true }, // attr: no-loop
    label: { type: String, default: "캐러셀" },
    prevLabel: { type: String, default: "이전 슬라이드" },
    nextLabel: { type: String, default: "다음 슬라이드" },
  };

  declare index: number;
  declare autoPlay: boolean;
  declare interval: number;
  declare hideDots: boolean;
  declare hideArrows: boolean;
  declare noLoop: boolean;
  declare label: string;
  declare prevLabel: string;
  declare nextLabel: string;

  #track!: HTMLElement;
  #prev!: HTMLButtonElement;
  #next!: HTMLButtonElement;
  #dots!: HTMLElement;
  #timer: Timer | null = null;
  #timerKey = "";
  #motion: Watcher<boolean> | null = null;
  #paused = false;
  /** connected() 이후에만 타이머를 돈다 (§3.1-3 — render 단계 비결정 금지) */
  #live = false;
  /** 프로그램적 스크롤 중에는 스크롤 → 인덱스 되맞춤을 하지 않는다 */
  #programmatic = false;
  #unlock: ReturnType<typeof setTimeout> | undefined;

  get slides(): HTMLElement[] {
    return this.#track
      ? Array.from(this.#track.querySelectorAll<HTMLElement>(":scope > .jd-carousel__slide"))
      : [];
  }

  get count(): number {
    return this.slides.length;
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(carouselStyles);
    this.setAttribute("role", "group");
    this.setAttribute("aria-roledescription", "carousel");

    const existing = this.querySelector<HTMLElement>(":scope > .jd-carousel__track");
    if (existing) {
      this.#track = existing;
      // 입양(§3.3): SSR/어댑터가 이미 감싼 슬라이드는 그대로 두고 맨 노드만 감싼다
      this.#adoptSlides(Array.from(this.#track.childNodes));
    } else {
      this.#track = document.createElement("div");
      this.#track.className = "jd-carousel__track";
      const nodes = Array.from(this.childNodes); // 트랙은 아직 자식이 아니다
      this.append(this.#track);
      this.#adoptSlides(nodes);
    }

    this.#prev =
      this.querySelector<HTMLButtonElement>(':scope > button[data-dir="prev"]') ??
      this.#buildArrow("prev", PREV_SVG);
    this.#next =
      this.querySelector<HTMLButtonElement>(':scope > button[data-dir="next"]') ??
      this.#buildArrow("next", NEXT_SVG);
    this.#dots =
      this.querySelector<HTMLElement>(":scope > .jd-carousel__dots") ?? this.#buildDots();
    this.update();
  }

  /**
   * 주어진 노드들을 순서대로 슬라이드로 감싸 트랙에 넣는다.
   * append는 "옮기기"이므로 원래 순서대로 넣으면 순서가 보존된다(멱등·입양 §3.3).
   */
  #adoptSlides(nodes: Node[]): void {
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
        node.parentNode?.removeChild(node); // 마크업 들여쓰기 공백은 슬라이드가 아니다
        continue;
      }
      if (node instanceof HTMLElement && node.classList.contains("jd-carousel__slide")) {
        this.#track.append(node);
        continue;
      }
      const slide = document.createElement("div");
      slide.className = "jd-carousel__slide";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.append(node);
      this.#track.append(slide);
    }
  }

  #buildArrow(dir: "prev" | "next", svg: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-carousel__arrow";
    b.dataset.dir = dir;
    b.innerHTML = svg;
    this.append(b);
    return b;
  }

  #buildDots(): HTMLElement {
    const box = document.createElement("div");
    box.className = "jd-carousel__dots";
    box.setAttribute("role", "group");
    this.append(box);
    return box;
  }

  protected override connected(): void {
    this.#live = true;
    this.addEventListener("click", this.#onClick);
    this.#track.addEventListener("scroll", this.#onTrackScroll, { passive: true });
    this.addEventListener("pointerenter", this.#pause);
    this.addEventListener("pointerleave", this.#resume);
    this.addEventListener("focusin", this.#pause);
    this.addEventListener("focusout", this.#resume);
    this.ownerDocument.addEventListener("visibilitychange", this.#syncAutoPlay);
    this.#motion = this.own(createReducedMotionWatcher());
    this.#motion.subscribe(() => this.#syncAutoPlay());
    this.#syncAutoPlay();
  }

  protected override disconnected(): void {
    this.#live = false;
    this.removeEventListener("click", this.#onClick);
    this.#track.removeEventListener("scroll", this.#onTrackScroll);
    this.removeEventListener("pointerenter", this.#pause);
    this.removeEventListener("pointerleave", this.#resume);
    this.removeEventListener("focusin", this.#pause);
    this.removeEventListener("focusout", this.#resume);
    this.ownerDocument.removeEventListener("visibilitychange", this.#syncAutoPlay);
    if (this.#unlock) clearTimeout(this.#unlock);
    this.#unlock = undefined;
    this.#programmatic = false;
    this.#stopTimer();
    this.#motion = null; // own()이 이미 destroy했다 — 참조만 끊는다
  }

  /* ── 이동 ─────────────────────────────────────────────────────────── */

  /** v2 scrollTo(index) 동형 — loop면 모듈로, 아니면 clamp */
  goTo(index: number): void {
    const count = this.count;
    if (count === 0) return;
    const target = this.noLoop
      ? Math.max(0, Math.min(index, count - 1))
      : ((index % count) + count) % count;
    const slide = this.slides[target];
    if (!slide) return;
    const changed = target !== this.index;
    this.index = target;
    // 트랙만 움직인다 — v2 scrollIntoView는 조상(문서)까지 끌고 다녔다
    this.#programmatic = true;
    this.#track.scrollTo({
      left: slide.offsetLeft - this.#track.offsetLeft,
      behavior: this.#reducedMotion ? "auto" : "smooth",
    });
    // 스무스 스크롤이 끝날 즈음 잠금 해제 (scrollend 미지원 브라우저 대비 타이머)
    if (this.#unlock) clearTimeout(this.#unlock);
    this.#unlock = setTimeout(() => {
      this.#programmatic = false;
      this.#unlock = undefined;
    }, 400);
    if (changed) this.emit("jd-change", { index: target, count });
  }

  prev(): void {
    this.goTo(this.index - 1);
  }

  next(): void {
    this.goTo(this.index + 1);
  }

  get #reducedMotion(): boolean {
    return this.#motion?.get() ?? false;
  }

  #onClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest("button");
    if (!btn || !this.contains(btn)) return;
    if (btn.dataset.dir === "prev") return this.prev();
    if (btn.dataset.dir === "next") return this.next();
    const dot = btn.dataset.index;
    if (dot !== undefined) this.goTo(Number(dot));
  };

  /** 사용자가 직접 스와이프한 경우 인덱스를 되맞춘다 (v2에는 없던 동기화) */
  #onTrackScroll = (): void => {
    if (this.#programmatic) return;
    const slides = this.slides;
    if (slides.length === 0) return;
    const left = this.#track.scrollLeft + this.#track.offsetLeft;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < slides.length; i++) {
      const d = Math.abs(slides[i]!.offsetLeft - left);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    if (nearest === this.index) return;
    this.index = nearest;
    this.emit("jd-change", { index: nearest, count: slides.length });
  };

  /* ── 자동재생 ─────────────────────────────────────────────────────── */

  #pause = (): void => {
    this.#paused = true;
    this.#syncAutoPlay();
  };

  #resume = (): void => {
    this.#paused = false;
    this.#syncAutoPlay();
  };

  #syncAutoPlay = (): void => {
    // #live를 먼저 본다 — render() 단계에서는 브라우저 상태를 읽지도 않는다(§3.1-3)
    if (!this.#live) return this.#stopTimer();
    const hidden = this.ownerDocument.visibilityState === "hidden";
    const shouldRun =
      this.autoPlay && this.count > 1 && !this.#paused && !hidden && !this.#reducedMotion;
    if (!shouldRun) return this.#stopTimer();
    // 간격이 그대로면 타이머를 다시 걸지 않는다 — update()마다 재시작하면 영영 안 돈다
    const key = String(Math.max(1, this.interval));
    if (this.#timer && this.#timerKey === key) return;
    this.#stopTimer();
    this.#timerKey = key;
    this.#timer = this.own(createInterval(() => this.next(), Number(key)));
  };

  #stopTimer(): void {
    this.#timer?.destroy();
    this.#timer = null;
    this.#timerKey = "";
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    const slides = this.slides;
    const count = slides.length;
    this.setAttribute("aria-label", this.label);

    slides.forEach((slide, i) => {
      slide.setAttribute("aria-label", `${i + 1} / ${count}`);
      slide.toggleAttribute("data-current", i === this.index);
    });

    const showArrows = !this.hideArrows && count > 1;
    this.#prev.hidden = !showArrows;
    this.#next.hidden = !showArrows;
    this.#prev.setAttribute("aria-label", this.prevLabel);
    this.#next.setAttribute("aria-label", this.nextLabel);
    // loop가 아니면 양 끝에서 비활성 — v2는 눌러도 아무 일이 없었다(무반응 버튼)
    this.#prev.disabled = this.noLoop && this.index <= 0;
    this.#next.disabled = this.noLoop && this.index >= count - 1;

    this.#dots.hidden = this.hideDots || count <= 1;
    this.#dots.setAttribute("aria-label", `${this.label} 슬라이드 선택`);
    if (this.#dots.childElementCount !== count) {
      this.#dots.textContent = "";
      for (let i = 0; i < count; i++) this.#dots.append(this.#buildDot(i));
    }
    Array.from(this.#dots.children).forEach((node, i) => {
      const dot = node as HTMLButtonElement;
      dot.setAttribute("aria-label", `슬라이드 ${i + 1}`);
      if (i === this.index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
      dot.toggleAttribute("data-active", i === this.index);
    });

    // autoPlay/interval 변경 반영 (연결 전에는 no-op — §3.1-3)
    this.#syncAutoPlay();
  }

  #buildDot(i: number): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-carousel__dot";
    b.dataset.index = String(i);
    return b;
  }
}
