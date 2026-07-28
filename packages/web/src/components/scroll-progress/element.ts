/**
 * <jd-scroll-progress> — 페이지·컨테이너 읽기 진행률 바 (v2 composites/ScrollProgress).
 *
 * v2 대비 교정 4건:
 *  1. **스크롤마다 측정했다.** v2는 scroll 이벤트 콜백에서 곧바로 scrollHeight/
 *     clientHeight를 읽었다 — 이벤트당 강제 리플로다. v3는 rAF 1프레임으로 합친다
 *     (05-perf · behaviors/scroll.ts의 onScrollMeasured와 같은 규율).
 *  2. **width 애니메이션 → transform**: 폭 전이는 프레임마다 레이아웃을 다시 돌린다.
 *     같은 그림을 scaleX로 낸다(합성만). RTL에서는 원점을 오른쪽으로 뒤집는다 —
 *     width 방식이 공짜로 갖던 방향성을 잃지 않게.
 *  3. **문서 길이 변화에 눈감았다.** 이미지 로드·아코디언 전개로 문서가 길어져도
 *     resize가 없으면 진행률이 틀린 채 남았다. 측정 대상에 ResizeObserver를 건다
 *     (behaviors/createSizeObserver).
 *  4. **target이 프로퍼티뿐이었다.** HTML만으로 컨테이너를 지정할 길이 없었다 —
 *     `for`(대상 요소 id, light DOM id 참조 §8)를 추가했다. DOM 노드를 직접 주고 싶으면
 *     `target` 프로퍼티가 그대로 있고, 둘 다 있으면 target이 이긴다.
 *
 * behaviors/createReadingProgress를 쓰지 않은 이유: 그 Behavior의 트리거는 window
 * scroll/resize 고정이라 **컨테이너 스크롤(`target`)에서는 값이 갱신되지 않는다**
 * (scroll 이벤트는 버블하지 않는다). v2 표면이 컨테이너를 포함하므로 트리거를
 * 대상별로 붙인다 — 리스너 자체는 behaviors/on 유틸을 쓴다.
 *
 * 프리렌더 결정성(§3.1-3): render()는 스크롤을 읽지 않는다. 초기값 0, 첫 실측은 connected().
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on } from "../../behaviors/input.js";
import { createSizeObserver } from "../../behaviors/viewport.js";
import scrollProgressStyles from "./scroll-progress.css.js";

export class JdScrollProgress extends JdElement {
  static override tag = "jd-scroll-progress";
  static override props = {
    /** top | bottom */
    position: { type: String, default: "top", reflect: true },
    /** 막대 색(CSS 값). 비우면 --jd-color-primary */
    color: { type: String },
    /** 두께(px). v2 기본 3 */
    thickness: { type: Number, default: 3 },
    /** 추적할 스크롤 컨테이너 요소의 id. 없으면 문서 전체 */
    for: { type: String },
    /** 스크린리더용 이름 */
    label: { type: String, default: "페이지 스크롤 진행률" },
  };

  declare position: string;
  declare color: string;
  declare thickness: number;
  declare for: string;
  declare label: string;

  #bar!: HTMLDivElement;
  #target: HTMLElement | null = null;
  #wired: EventTarget | null = null;
  #wiredBox: Element | null = null;
  #teardown: Array<() => void> = [];
  #raf = 0;
  #percent = 0;
  #announced = -1;

  /** 0~100. 읽기 전용 — 스크롤이 값의 단일 소스다 */
  get value(): number {
    return this.#percent;
  }

  /** 추적 대상 컨테이너(노드 직접 지정). `for` attribute보다 우선 */
  get target(): HTMLElement | null {
    return this.#target;
  }
  set target(v: HTMLElement | null) {
    this.#target = v;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(scrollProgressStyles);
    // 입양(§3.3)
    const existing = this.querySelector<HTMLDivElement>(":scope > .jd-scroll-progress__bar");
    if (existing) {
      this.#bar = existing;
    } else {
      this.#bar = document.createElement("div");
      this.#bar.className = "jd-scroll-progress__bar";
      this.append(this.#bar);
    }
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", "100");
    this.setAttribute("aria-valuenow", "0"); // 실측 전 초기값 — 프리렌더 고정
    this.update();
  }

  protected override connected(): void {
    this.own({ destroy: () => this.#unwire() });
    this.#wireUp(); // 첫 실측은 여기 — render()가 아니다
  }

  /** 측정 대상 박스: 컨테이너 또는 문서 루트 */
  #box(): HTMLElement {
    return this.#resolveTarget() ?? this.ownerDocument.documentElement;
  }

  #resolveTarget(): HTMLElement | null {
    if (this.#target) return this.#target;
    return this.for ? this.ownerDocument.getElementById(this.for) : null;
  }

  /** 스크롤 이벤트 발원지: 컨테이너면 그 요소, 문서면 window */
  #source(): EventTarget {
    return this.#resolveTarget() ?? window;
  }

  #wireUp(): void {
    this.#unwire();
    const source = this.#source();
    const box = this.#box();
    this.#wired = source;
    this.#wiredBox = this.#resolveTarget();
    this.#teardown.push(on(source, "scroll", this.#tick, { passive: true }));
    // 뷰포트가 바뀌면 clientHeight가 바뀐다 — 대상이 무엇이든 resize는 항상 듣는다
    this.#teardown.push(on(window, "resize", this.#tick, { passive: true }));
    const ro = createSizeObserver(box, this.#tick);
    this.#teardown.push(() => ro.destroy());
    this.#measure();
  }

  #unwire(): void {
    for (const off of this.#teardown) off();
    this.#teardown = [];
    this.#wired = null;
    this.#wiredBox = null;
    if (this.#raf) {
      cancelAnimationFrame(this.#raf);
      this.#raf = 0;
    }
  }

  /** 스크롤·리사이즈를 rAF 한 번으로 합친다 — 이벤트마다 레이아웃을 읽지 않는다 */
  #tick = (): void => {
    if (this.#raf) return;
    this.#raf = requestAnimationFrame(() => {
      this.#raf = 0;
      this.#measure();
    });
  };

  #measure(): void {
    const box = this.#box();
    const max = box.scrollHeight - box.clientHeight;
    const percent = max > 0 ? Math.min(100, Math.max(0, (box.scrollTop / max) * 100)) : 0;
    if (percent === this.#percent) return;
    this.#percent = percent;
    this.#paint();
    // 이벤트는 정수 퍼센트가 바뀔 때만 — 프레임마다 발행하면 초당 60건이 된다
    const rounded = Math.round(percent);
    if (rounded !== this.#announced) {
      this.#announced = rounded;
      this.emit("jd-change", { percent, rounded });
    }
  }

  #paint(): void {
    // 인라인 longhand가 아니라 커스텀 프로퍼티 — 소비자 CSS 오버라이드 서열 유지(§4.4)
    this.style.setProperty("--jd-scroll-progress-scale", String(this.#percent / 100));
    this.setAttribute("aria-valuenow", String(Math.round(this.#percent)));
  }

  protected override update(): void {
    this.style.setProperty("--jd-scroll-progress-thickness", `${this.thickness}px`);
    if (this.color) this.style.setProperty("--jd-scroll-progress-color", this.color);
    else this.style.removeProperty("--jd-scroll-progress-color");
    this.setAttribute("aria-label", this.label);
    // 대상이 바뀌었으면 리스너를 옮긴다 (연결 전에는 connected()가 처리)
    if (this.#teardown.length > 0) {
      if (this.#source() !== this.#wired || this.#resolveTarget() !== this.#wiredBox)
        this.#wireUp();
    }
  }
}
