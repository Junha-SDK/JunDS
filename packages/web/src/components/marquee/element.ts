/**
 * <jd-marquee> — 가로로 무한히 흐르는 띠 (v2 composites/Marquee).
 *
 * v2 대비 실질 개선 5건:
 *  1. **이음매가 튀지 않는다.** v2는 두 벌 사이에 `gap`을 두고 트랙을 `translateX(-50%)`
 *     시켰다. 트랙 폭이 `2W + g`이므로 -50%는 `W + g/2`만 움직인다 — 한 바퀴마다
 *     `g/2`씩 어긋나 간격에서 눈에 띄게 덜컹였다. v3는 `(-100% - gap) / 사본수`로
 *     정확히 한 벌 + 한 간격만큼 민다(사본이 몇 벌이든 성립하는 식).
 *  2. **짧은 내용에 빈 구간이 없다.** 내용이 컨테이너보다 좁으면 v2는 두 벌 뒤로 허공이
 *     지나갔다. v3는 연결 후(§3.1-3 준수 — 측정은 connected 이후) 폭을 재어 필요한
 *     만큼만 복제한다. render()가 만드는 기본 2벌은 언제나 결정적이다.
 *  3. **키프레임이 문서에 1장.** v2는 인스턴스마다 <style>에 같은 @keyframes를 심었다.
 *  4. **복제본이 id를 훔치지 않는다.** children에 id가 있으면 v2는 문서에 중복 id를
 *     만들었다(라벨 참조가 엉뚱한 쪽을 가리켰다) — 복제본에서 id를 벗긴다.
 *  5. **감속 선호·키보드 정지.** prefers-reduced-motion이면 멈추고, 포커스가 안으로
 *     들어와도(:focus-within) 멈춘다 — v2는 마우스 호버만 알았다.
 *
 * ARIA 판단: v2의 `role="marquee"`를 **뺐다**. 내용은 바뀌지 않고 시각적으로 흐를 뿐인데
 * marquee는 라이브 리전 역할이라 AT에 "갱신되는 영역"으로 알려진다. 원본 한 벌만
 * 접근성 트리에 남기고(복제본은 aria-hidden) 역할은 주지 않는 편이 정확하다.
 *
 * 표면 주의: v2 기본값이 true인 `pauseOnHover`는 반전 플래그 `no-pause`로 낸다(§1.3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createSizeObserver } from "../../behaviors/viewport.js";
import { debounce } from "../../behaviors/timing.js";
import type { Behavior } from "../../behaviors/types.js";
import marqueeStyles from "./marquee.css.js";

const CLS = "jd-marquee";
/** render()가 항상 만드는 사본 수 — 프리렌더 스냅샷의 고정점 */
const BASE_COPIES = 2;
/** 자동 채움 상한. 아주 좁은 내용이 DOM을 폭파하지 않게 */
const MAX_COPIES = 16;

export class JdMarquee extends JdElement {
  static override tag = "jd-marquee";
  static override props = {
    /** 한 바퀴 도는 시간(초). v2 기본 30 */
    speed: { type: Number, default: 30 },
    /** left | right — v2 direction */
    direction: { type: String, default: "left", reflect: true },
    /** v2 pauseOnHover=true의 반전 플래그. 켜면 호버해도 멈추지 않는다 */
    noPause: { type: Boolean, reflect: true }, // attr: no-pause
    /** 항목 사이 간격(px). v2 기본 48 */
    gap: { type: Number, default: 48 },
    /** 명시적 정지 — 문서·스냅샷용 */
    paused: { type: Boolean, reflect: true },
  };

  declare speed: number;
  declare direction: string;
  declare noPause: boolean;
  declare gap: number;
  declare paused: boolean;

  #track!: HTMLDivElement;
  #group!: HTMLDivElement;
  #live = false;
  #sizeObserver: Behavior | null = null;
  #mutations: MutationObserver | null = null;
  #copies = BASE_COPIES;

  protected render(): void {
    adoptStyles(marqueeStyles);
    const existing = this.querySelector<HTMLDivElement>(`:scope > .${CLS}__track`);
    if (existing) {
      this.#track = existing;
      this.#group = existing.querySelector<HTMLDivElement>(`:scope > .${CLS}__group`)!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const doc = this.ownerDocument;
    const kids = Array.from(this.childNodes);
    this.#track = doc.createElement("div");
    this.#track.className = `${CLS}__track`;
    this.#group = doc.createElement("div");
    this.#group.className = `${CLS}__group`;
    this.#group.append(...kids); // 원본 한 벌 — 접근성 트리에 남는 유일한 사본
    this.#track.append(this.#group, this.#cloneGroup());
    this.append(this.#track);
  }

  /** 시각용 복제본. 접근성 트리에서 빠지고 id는 벗긴다 */
  #cloneGroup(): HTMLElement {
    const clone = this.#group.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    clone.dataset.jdClone = "";
    clone.removeAttribute("id");
    for (const el of clone.querySelectorAll("[id]")) el.removeAttribute("id");
    return clone;
  }

  protected override connected(): void {
    this.#live = true;
    this.#sizeObserver ??= this.own(createSizeObserver(this, this.#refit));
    if (!this.#mutations && typeof MutationObserver !== "undefined") {
      // 원본 내용이 바뀌면 복제본이 낡는다 — 복제본은 group의 형제라 되먹임이 없다
      this.#mutations = new MutationObserver(this.#refit);
      this.#mutations.observe(this.#group, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
    this.refresh();
  }

  protected override disconnected(): void {
    this.#live = false;
    this.#sizeObserver = null; // own()이 이미 destroy했다
    this.#mutations?.disconnect();
    this.#mutations = null;
    this.#refit.cancel();
  }

  protected override update(): void {
    const gap = Math.max(0, this.gap);
    this.style.setProperty("--jd-marquee-gap", `${gap}px`);
    this.style.setProperty("--jd-marquee-duration", `${Math.max(0.1, this.speed)}s`);
    this.style.setProperty("--jd-marquee-copies", String(this.#copies));
    if (this.#live) this.refresh(); // gap 변경은 필요한 사본 수를 바꾼다
  }

  /** 내용이나 폭이 바뀐 뒤 사본 수를 다시 맞춘다 */
  refresh(): void {
    if (!this.#live) return;
    const hostWidth = this.clientWidth;
    const groupWidth = this.#group.getBoundingClientRect().width;
    if (!(hostWidth > 0) || !(groupWidth > 0)) return;
    const gap = Math.max(0, this.gap);
    const need = Math.min(
      MAX_COPIES,
      Math.max(BASE_COPIES, Math.ceil(hostWidth / (groupWidth + gap)) + 1),
    );
    this.#setCopies(need);
  }

  /** 측정은 연결 이후에만 — render()는 언제나 BASE_COPIES 그대로다(§3.1-3) */
  #refit = debounce((): void => {
    this.refresh();
  }, 100);

  #setCopies(n: number): void {
    const clones = this.#track.querySelectorAll<HTMLElement>(`:scope > [data-jd-clone]`);
    for (let i = clones.length; i < n - 1; i++) this.#track.append(this.#cloneGroup());
    for (let i = n - 1; i < clones.length; i++) clones.item(i)?.remove();
    if (n !== this.#copies) {
      this.#copies = n;
      this.style.setProperty("--jd-marquee-copies", String(n));
    }
  }
}
