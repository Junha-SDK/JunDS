/**
 * <jd-typewriter> — 문장을 한 글자씩 쳐 나가는 타이핑 효과 (v2 composites/Typewriter).
 *
 * 결정적 렌더(§3.1-3): render()는 시계를 만지지 않고 **첫 문장을 통째로** 칠한다.
 * 애니메이션이 없는 모든 경로(프리렌더 스냅샷·타이머 없는 환경·감속 선호)의 정답이
 * 언제나 "완성된 문장"이다 — jd-animated-counter가 최종값을 칠하는 것과 같은 규율이다.
 * v2는 useState(0)이 초기값이라 서버 HTML이 항상 빈 문자열이었다.
 *
 * v2 대비 실질 개선 4건:
 *  1. **`loop={false}`가 실제로 멈춘다.** v2는 마지막 문장을 지운 뒤 onComplete를 부르고
 *     return했지만 그 직전에 isDeleting을 false로 되돌려, effect가 곧바로 **같은 문장을
 *     다시 타이핑**했다 — 영원히. v3의 `once`는 마지막 문장을 다 친 자리에서 멈춘다
 *     (지우지 않는다 — "완주"의 자연스러운 끝은 완성된 문장이다).
 *  2. **빈 배열이 폭주하지 않는다.** v2는 texts=[]이면 charIdx가 음수로 내려가며
 *     타이머를 계속 갈았다.
 *  3. **낭독기가 글자를 세지 않는다.** v2는 매 프레임 바뀌는 span에 aria-label을 걸었다.
 *     v3는 변하는 조각을 aria-hidden으로 덮고 **완성된 현재 문장** 하나를 숨은 텍스트로
 *     둔다(jd-animated-counter·jd-countdown과 같은 판단).
 *  4. **감속 선호를 존중한다.** prefers-reduced-motion이면 타이핑도 커서 깜빡임도 없이
 *     완성된 문장만 보여준다(§8).
 *
 * 표면 주의: v2 기본값이 true인 `loop`·`cursor`는 attribute로 표현할 수 없어(존재=값,
 * §1.3) 반전 플래그 `once` / `hide-cursor`로 낸다. 무지정 기본 동작은 v2와 같다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createTimeout, type Timer } from "../../behaviors/timing.js";
import { createReducedMotionWatcher } from "../../behaviors/media.js";
import type { Watcher } from "../../behaviors/subscribe.js";
import typewriterStyles from "./typewriter.css.js";

const CLS = "jd-typewriter";

export class JdTypewriter extends JdElement {
  static override tag = "jd-typewriter";
  static override props = {
    /** 문장이 하나면 attribute로 충분하다. texts 프로퍼티가 있으면 그쪽이 이긴다 */
    text: { type: String },
    /** 타이핑 속도(ms/글자). v2 기본 80 */
    speed: { type: Number, default: 80 },
    /** 삭제 속도(ms/글자). v2 기본 40 */
    deleteSpeed: { type: Number, default: 40 },
    /** 다 친 뒤 지우기 시작까지의 지연(ms). v2 기본 2000 */
    delay: { type: Number, default: 2000 },
    /** v2 loop=true의 반전 플래그. 켜면 마지막 문장에서 멈춘다 */
    once: { type: Boolean, reflect: true },
    /** v2 cursor=true의 반전 플래그. 켜면 커서를 그리지 않는다 */
    hideCursor: { type: Boolean, reflect: true }, // attr: hide-cursor
    /** 커서 문자. v2 기본 "|" */
    cursorChar: { type: String, default: "|" },
  };

  declare text: string;
  declare speed: number;
  declare deleteSpeed: number;
  declare delay: number;
  declare once: boolean;
  declare hideCursor: boolean;
  declare cursorChar: string;

  #typedEl!: HTMLSpanElement;
  #cursorEl!: HTMLSpanElement;
  #srEl!: HTMLSpanElement;

  #texts: string[] = [];
  #index = 0;
  #chars = 0;
  #deleting = false;
  #started = false;
  #finished = false;
  #timer: Timer | null = null;
  #motion: Watcher<boolean> | null = null;

  /** 순환 표시할 문장 배열 (복합 데이터 — property 전용, §1.3) */
  get texts(): string[] {
    return [...this.#texts];
  }
  set texts(v: string[]) {
    this.#texts = Array.isArray(v) ? v.filter((t): t is string => typeof t === "string") : [];
    this.#reset();
    this.requestUpdate();
  }

  /** 지금 타이핑 중인 문장의 완성형 */
  get current(): string {
    return this.#list[this.#index] ?? "";
  }

  /** texts가 비었으면 text attribute 1개짜리 목록으로 대신한다 */
  get #list(): string[] {
    if (this.#texts.length > 0) return this.#texts;
    return this.text ? [this.text] : [];
  }

  protected render(): void {
    adoptStyles(typewriterStyles);
    this.#consumeSlots();

    const existing = this.querySelector<HTMLSpanElement>(`:scope > .${CLS}__typed`);
    if (existing) {
      this.#typedEl = existing;
      this.#cursorEl = this.querySelector<HTMLSpanElement>(`:scope > .${CLS}__cursor`)!;
      this.#srEl = this.querySelector<HTMLSpanElement>(`:scope > .${CLS}__sr`)!;
    } else {
      this.#build();
    }

    // 정지 상태의 정답 = 완성된 첫 문장
    this.#chars = this.current.length;
    this.#paint();
  }

  /**
   * 선언적 초기화 2경로(§1.3 예외):
   *  - `<script type="application/json">["a","b"]</script>` 슬롯
   *  - 그냥 쓴 텍스트 children (한 문장짜리 관용 표기)
   * 둘 다 1회 소비하고 골격을 짓는다. 입양 경로(§3.3)에서는 아무것도 건드리지 않는다.
   */
  #consumeSlots(): void {
    if (this.querySelector(`:scope > .${CLS}__typed`)) return;
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (script) {
      try {
        const parsed: unknown = JSON.parse(script.textContent || "[]");
        if (Array.isArray(parsed)) {
          this.#texts = parsed.filter((t): t is string => typeof t === "string");
        }
      } catch {
        console.warn("[junds] <jd-typewriter> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      script.remove();
    }
    const seed = (this.textContent ?? "").trim();
    if (this.#texts.length === 0 && !this.text && seed) this.text = seed;
    this.replaceChildren();
  }

  #build(): void {
    const doc = this.ownerDocument;
    // 변하는 조각은 접근성 트리에서 뺀다 — 낭독은 __sr이 맡는다
    this.#typedEl = doc.createElement("span");
    this.#typedEl.className = `${CLS}__typed`;
    this.#typedEl.setAttribute("aria-hidden", "true");
    this.#cursorEl = doc.createElement("span");
    this.#cursorEl.className = `${CLS}__cursor`;
    this.#cursorEl.setAttribute("aria-hidden", "true");
    this.#srEl = doc.createElement("span");
    this.#srEl.className = `${CLS}__sr`;
    this.append(this.#typedEl, this.#cursorEl, this.#srEl);
  }

  protected override connected(): void {
    this.#started = true;
    if (!this.#motion) {
      const motion = this.own(createReducedMotionWatcher());
      motion.subscribe(() => this.#restart());
      this.#motion = motion;
    }
    this.#restart();
  }

  protected override disconnected(): void {
    this.#timer?.destroy();
    this.#timer = null;
    this.#motion = null; // own()이 이미 destroy했다 — 참조만 끊는다
    this.#started = false;
  }

  protected override update(): void {
    if (!this.#started) {
      this.#chars = this.current.length; // 프리렌더 경로 — 완성형만
      this.#paint();
      return;
    }
    this.#restart();
  }

  /** 진행 중이던 구간을 버리고 현재 상태에서 다시 굴린다 */
  #restart(): void {
    this.#timer?.destroy();
    this.#timer = null;
    const list = this.#list;
    if (this.#index >= list.length) this.#reset();
    if (list.length === 0 || this.#motion?.get() === true || this.#finished) {
      // 애니메이션이 없는 경로의 정답은 언제나 완성형이다
      if (!this.#finished) this.#chars = this.current.length;
      this.#paint();
      return;
    }
    this.#chars = Math.min(this.#chars, this.current.length);
    this.#paint();
    this.#schedule(this.#deleting ? this.deleteSpeed : this.speed);
  }

  #reset(): void {
    this.#index = 0;
    this.#chars = 0;
    this.#deleting = false;
    this.#finished = false;
  }

  /** 다음 한 걸음을 예약한다. 살아 있는 타이머는 항상 1개 */
  #schedule(ms: number): void {
    this.#timer?.destroy();
    this.#timer = createTimeout(this.#step, Math.max(0, ms));
  }

  #step = (): void => {
    this.#timer = null;
    const list = this.#list;
    if (list.length === 0) return;
    const target = this.current;

    if (!this.#deleting) {
      if (this.#chars < target.length) {
        this.#chars += 1;
        this.#paint();
        this.#schedule(this.speed);
        return;
      }
      // 다 쳤다 — 마지막 문장 + once면 여기서 끝난다(v2의 무한 재타이핑 수정)
      if (this.once && this.#index >= list.length - 1) {
        this.#finished = true;
        this.emit("jd-complete", { text: target, index: this.#index });
        return;
      }
      this.#deleting = true;
      this.#schedule(this.delay);
      return;
    }

    if (this.#chars > 0) {
      this.#chars -= 1;
      this.#paint();
      this.#schedule(this.deleteSpeed);
      return;
    }
    this.#deleting = false;
    this.#index = (this.#index + 1) % list.length;
    this.#paint();
    this.#schedule(this.speed);
  };

  #paint(): void {
    const target = this.current;
    const shown = target.slice(0, this.#chars);
    if (this.#typedEl.textContent !== shown) this.#typedEl.textContent = shown;
    // 낭독은 진행 중에도 **완성형**만 본다 — 화면의 중간 상태를 따라가지 않는다
    if (this.#srEl.textContent !== target) this.#srEl.textContent = target;
    if (this.#cursorEl.textContent !== this.cursorChar) {
      this.#cursorEl.textContent = this.cursorChar;
    }
    this.#cursorEl.hidden = this.hideCursor;
  }
}
