/**
 * <jd-auto-play-demo> — 여러 프레임을 자동으로 순환해 보여주는 데모 상자
 * (v2 composites/AutoPlayDemo).
 *
 * 프레임은 **children**이다 — 호스트의 자식 하나가 프레임 하나가 되고, render()가
 * `.jd-auto-play-demo__frame`으로 감싼다(입양 규칙 §3.3: 이미 감싸져 있으면 그대로).
 * v2의 `frames: ReactNode[]`를 attribute로 실을 방법은 없고(WEB-03), 여기서 프레임은
 * "데이터"가 아니라 마크업이라 JSON 슬롯도 맞지 않는다 — jd-carousel 슬라이드와 동형.
 *
 *   <jd-auto-play-demo interval="1000" transition="fade">
 *     <jd-button>Primary</jd-button>
 *     <jd-button variant="danger">Danger</jd-button>
 *   </jd-auto-play-demo>
 *
 * v2 대비 실질 개선 6건:
 *  1. **멈출 수 있다(WCAG 2.2.2).** v2는 마운트되는 순간부터 영원히 돌았다 — 포인터가
 *     올라가 있어도, 포커스가 안에 있어도, 탭이 백그라운드여도. v3는 hover·
 *     focus-within·문서 hidden에서 멈추고 `paused` 속성으로 명시 정지도 된다
 *     (jd-carousel 자동재생 규율 그대로).
 *  2. **감속 선호를 존중한다.** prefers-reduced-motion이면 자동 순환을 시작하지 않고
 *     첫 프레임에 고정된다. 전이도 CSS가 함께 끈다(§8).
 *  3. **상자가 가장 큰 프레임에 맞는다.** v2는 첫 프레임만 흐름에 두고(`relative`)
 *     나머지를 `absolute inset-0`으로 겹쳐, 두 번째 프레임이 더 크면 상자를 넘쳐
 *     아래 콘텐츠를 덮었다. v3는 프레임 전부를 같은 grid 칸에 넣는다 — 높이는
 *     최댓값이고 "첫 프레임"이라는 특권도 사라진다.
 *  4. **`transition="none"`이 진짜 즉시 교체다.** v2는 none일 때 나가는 프레임에
 *     아무 클래스도 주지 않아 **불투명도 1 그대로** duration(기본 400ms) 동안 새
 *     프레임과 겹쳐 있었다 — 가장 안 튀어야 할 설정이 가장 지저분했다.
 *  5. **보이는 프레임을 실제로 만질 수 있다.** v2는 전 프레임에 `pointer-events-none`을
 *     걸었지만 포커스는 막지 못해, 활성 프레임의 버튼이 탭 순서에 남고도 클릭은
 *     안 되는 함정이 됐다. v3는 활성 프레임만 상호작용을 열고(포커스가 들어오면
 *     순환이 멈춘다) 나머지는 visibility:hidden이라 탭 순서·접근성 트리에서 함께 빠진다.
 *  6. **위치가 관측·제어 가능하다.** `index` 프로퍼티/속성 + goTo/next/prev +
 *     `jd-change` 이벤트. v2는 내부 useState라 밖에서 손댈 수 없었다.
 *
 * 발견: v2의 `transition="crossfade"`는 `fade`와 **완전히 같은 정의**였다(enter
 * opacity-100 / exit opacity-0). 값을 살리되 별칭임을 문서화한다 — 없애면 v2 소비
 * 코드가 깨지고, 다르게 만들면 없던 동작을 발명하는 것이라 둘 다 패리티 위반이다.
 *
 * 이벤트: `jd-change` `{ index, count }` — 프레임이 바뀐 **직후**, cancelable:false(§1.5).
 * 자동 갱신 영역이지만 aria-live는 주지 않는다: 프레임은 같은 UI의 변주라 낭독을
 * 반복시키면 소음이 된다(jd-marquee가 role="marquee"를 뺀 것과 같은 판단).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createInterval, createTimeout, type Timer } from "../../behaviors/timing.js";
import { createReducedMotionWatcher } from "../../behaviors/media.js";
import type { Watcher } from "../../behaviors/subscribe.js";
import autoPlayDemoStyles from "./auto-play-demo.css.js";

const CLS = "jd-auto-play-demo";
const FRAME = `${CLS}__frame`;

export class JdAutoPlayDemo extends JdElement {
  static override tag = "jd-auto-play-demo";
  static override props = {
    /** 현재 프레임 (0-base) */
    index: { type: Number, default: 0, reflect: true },
    /** 프레임 전환 간격(ms). v2 기본 1500 */
    interval: { type: Number, default: 1500 },
    /** fade | slide-up | slide-left | scale | crossfade(=fade 별칭) | none */
    transition: { type: String, default: "fade", reflect: true },
    /** 전환 지속 시간(ms). v2 기본 400 */
    duration: { type: Number, default: 400 },
    /** 명시적 정지 — 문서·스냅샷·소비자 제어용 */
    paused: { type: Boolean, reflect: true },
    /** 상자의 접근 이름 */
    label: { type: String, default: "자동 재생 데모" },
  };

  declare index: number;
  declare interval: number;
  declare transition: string;
  declare duration: number;
  declare paused: boolean;
  declare label: string;

  #timer: Timer | null = null;
  #timerKey = "";
  #leaveTimer: Timer | null = null;
  #leaving: HTMLElement | null = null;
  #motion: Watcher<boolean> | null = null;
  /** 포인터/포커스가 안에 있는 동안의 일시 정지 */
  #held = false;
  /** connected() 이후에만 타이머를 돈다 (§3.1-3 — render 단계 비결정 금지) */
  #live = false;
  /** 마지막으로 화면에 세운 인덱스. -1이면 아직 없음 */
  #shown = -1;

  get frames(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(`:scope > .${FRAME}`));
  }

  get count(): number {
    return this.frames.length;
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(autoPlayDemoStyles);
    this.setAttribute("role", "group");
    this.#wrapChildren();
    this.update();
  }

  /**
   * 자식 하나 = 프레임 하나. 이미 프레임이면 그대로 두고(입양 §3.3), 공백 텍스트는
   * 버린다. 자리를 지키며 감싸므로 서열이 흔들리지 않는다.
   */
  #wrapChildren(): void {
    for (const node of Array.from(this.childNodes)) {
      if (node instanceof HTMLElement && node.classList.contains(FRAME)) continue;
      if (node.nodeType === Node.TEXT_NODE && !(node.textContent ?? "").trim()) {
        node.parentNode?.removeChild(node);
        continue;
      }
      if (node.nodeType === Node.COMMENT_NODE) continue;
      const frame = this.ownerDocument.createElement("div");
      frame.className = FRAME;
      this.insertBefore(frame, node); // 원래 자리에 껍데기를 먼저 꽂고
      frame.append(node); // 내용을 그 안으로 옮긴다
    }
  }

  /* ── 수명 ─────────────────────────────────────────────────────────── */

  protected override connected(): void {
    this.#live = true;
    this.addEventListener("pointerenter", this.#hold);
    this.addEventListener("pointerleave", this.#release);
    this.addEventListener("focusin", this.#hold);
    this.addEventListener("focusout", this.#release);
    this.ownerDocument.addEventListener("visibilitychange", this.#syncAutoPlay);
    if (!this.#motion) {
      this.#motion = this.own(createReducedMotionWatcher());
      this.#motion.subscribe(() => this.#syncAutoPlay());
    }
    this.#syncAutoPlay();
  }

  protected override disconnected(): void {
    this.#live = false;
    this.removeEventListener("pointerenter", this.#hold);
    this.removeEventListener("pointerleave", this.#release);
    this.removeEventListener("focusin", this.#hold);
    this.removeEventListener("focusout", this.#release);
    this.ownerDocument.removeEventListener("visibilitychange", this.#syncAutoPlay);
    this.#stopTimer();
    this.#clearLeaving();
    this.#motion = null; // own()이 destroy까지 책임진다 — 참조만 끊는다
  }

  /* ── 이동 ─────────────────────────────────────────────────────────── */

  /** 순환 이동 — 범위를 벗어난 값은 모듈로로 접는다 */
  goTo(index: number): void {
    const count = this.count;
    if (count === 0) return;
    this.index = ((Math.trunc(index) % count) + count) % count;
  }

  next(): void {
    this.goTo(this.index + 1);
  }

  prev(): void {
    this.goTo(this.index - 1);
  }

  /* ── 자동재생 ─────────────────────────────────────────────────────── */

  get #reducedMotion(): boolean {
    return this.#motion?.get() ?? false;
  }

  /** 전이를 그릴 상황인가 — none·감속 선호면 나가는 프레임을 두지 않는다 */
  get #animates(): boolean {
    return this.transition !== "none" && !this.#reducedMotion;
  }

  #hold = (): void => {
    this.#held = true;
    this.#syncAutoPlay();
  };

  #release = (): void => {
    this.#held = false;
    this.#syncAutoPlay();
  };

  #syncAutoPlay = (): void => {
    const hidden = this.ownerDocument.visibilityState === "hidden";
    const ms = Math.max(1, Math.trunc(this.interval) || 1);
    const run =
      this.#live &&
      !this.paused &&
      !this.#held &&
      !hidden &&
      !this.#reducedMotion &&
      this.count > 1;
    const key = run ? `run:${ms}` : "";
    // 같은 조건이면 돌던 타이머를 그대로 둔다 — 무관한 update()가 박자를 흔들지 않는다
    if (key === this.#timerKey && (!run || this.#timer)) return;
    this.#stopTimer();
    this.#timerKey = key;
    if (run) this.#timer = createInterval(() => this.next(), ms);
  };

  #stopTimer(): void {
    this.#timer?.destroy();
    this.#timer = null;
    this.#timerKey = "";
  }

  /** 나가는 프레임을 duration 동안만 살려 둔다 */
  #startLeaving(el: HTMLElement, ms: number): void {
    this.#clearLeaving();
    el.setAttribute("data-leaving", "");
    this.#leaving = el;
    this.#leaveTimer = createTimeout(() => {
      this.#leaveTimer = null;
      this.#clearLeaving();
    }, ms);
  }

  #clearLeaving(): void {
    this.#leaveTimer?.destroy();
    this.#leaveTimer = null;
    this.#leaving?.removeAttribute("data-leaving");
    this.#leaving = null;
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    const frames = this.frames;
    const count = frames.length;
    const ms = this.#animates ? Math.max(0, Math.trunc(this.duration)) : 0;
    this.style.setProperty(`--${CLS}-duration`, `${ms}ms`);
    this.setAttribute("aria-label", this.label);

    if (count === 0) {
      this.#shown = -1;
      this.#syncAutoPlay();
      return;
    }

    const target = ((Math.trunc(this.index) % count) + count) % count;
    // 범위 밖 값은 한 번만 되접는다 — 다음 update()에서는 같은 값이라 재진입이 끝난다
    if (target !== this.index) this.index = target;

    if (target !== this.#shown) {
      const previous = frames[this.#shown];
      this.#clearLeaving();
      if (previous && this.#shown >= 0 && this.#animates && ms > 0) {
        this.#startLeaving(previous, ms);
      }
      const first = this.#shown < 0;
      this.#shown = target;
      // 첫 칠(프리렌더 포함)은 "바뀐" 것이 아니다 — 통지하지 않는다
      if (!first) this.emit("jd-change", { index: target, count });
    }

    frames.forEach((frame, i) => {
      const active = i === target;
      frame.toggleAttribute("data-active", active);
      if (active) frame.removeAttribute("data-leaving");
    });

    this.#syncAutoPlay(); // interval·paused·프레임 수 변경 반영
  }
}
