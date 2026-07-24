/**
 * <jd-confetti> — 축하 시점에 화면을 덮는 색종이 (v2 composites/Confetti).
 *
 * 결정적 렌더(§3.1-3): 파티클 좌표·색·지연은 전부 난수다. **render()/update()에서는
 * 절대 만들지 않는다** — 03-web-arch가 Confetti를 이 규칙의 예시로 직접 지목한다
 * ("랜덤·시간이 필요한 표현은 connected() 이후 rAF/타이머에서 시작"). 파티클 생성은
 * `#live`(연결 이후) 게이트를 통과한 경로에서만 일어나므로 프리렌더 스냅샷에는
 * 빈 호스트만 남는다.
 *
 * v2 대비 실질 개선 5건:
 *  1. **키프레임이 문서에 1장.** v2는 발사할 때마다 <style>을 트리에 심었다.
 *  2. **회전 주기 난수를 style 문자열에서 뺐다.** v2는 파티클마다 `animation:
 *     confetti-spin ${600 + Math.random()*400}ms …` 문자열을 새로 만들어 React가
 *     리렌더할 때마다 회전이 튀었다 — v3는 CSS 변수 1개만 심는다.
 *  3. **감속 선호를 존중한다**(§8). 파티클을 만들지 않되 `jd-complete` 계약은 그대로
 *     지킨다 — 소비자 코드가 모션 설정에 따라 갈리지 않는다.
 *  4. **명령형 발사구**(`fire()`). v2는 active를 false→true로 흔들어야 재발사됐다.
 *  5. **파티클 수에 상한**(1~1000). v2는 count를 그대로 믿어 오타 하나로 DOM이 터졌다.
 *
 * z-index는 v2의 `z-[9999]` 대신 `--jd-z-max` 토큰을 쓴다. 호스트 자체가 덮개이며
 * `aria-hidden` + `pointer-events: none`이라 아래 UI를 가리지도 막지도 않는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createTimeout, type Timer } from "../../behaviors/timing.js";
import { createReducedMotionWatcher } from "../../behaviors/media.js";
import type { Watcher } from "../../behaviors/subscribe.js";
import confettiStyles from "./confetti.css.js";

const CLS = "jd-confetti";
const SHAPES = ["square", "circle", "strip"] as const;
/** v2 COLORS — 토큰 이름만 v3로 옮겼다 */
const COLORS = [
  "var(--jd-color-primary)",
  "var(--jd-color-success)",
  "var(--jd-color-warning)",
  "var(--jd-color-danger)",
  "var(--jd-color-info)",
  "var(--jd-color-accent)",
];
const MAX_COUNT = 1000;

/** 스타일 문자열 길이를 억제한다 — 파티클 수백 개면 소수점 꼬리가 그대로 비용이다 */
const r1 = (v: number): number => Math.round(v * 10) / 10;

export class JdConfetti extends JdElement {
  static override tag = "jd-confetti";
  static override props = {
    /** 활성화 여부. 켜지는 순간 발사된다 */
    active: { type: Boolean, reflect: true },
    /** 파티클 수. v2 기본 50 */
    count: { type: Number, default: 50 },
    /** 낙하 시간(ms). v2 기본 3000 */
    duration: { type: Number, default: 3000 },
  };

  declare active: boolean;
  declare count: number;
  declare duration: number;

  #colors: string[] = COLORS;
  #live = false;
  #running = false;
  #wasActive = false;
  #timer: Timer | null = null;
  #motion: Watcher<boolean> | null = null;

  /** 파티클 색 목록 (복합 데이터 — property 전용, §1.3) */
  get colors(): string[] {
    return [...this.#colors];
  }
  set colors(v: string[]) {
    const next = Array.isArray(v) ? v.filter((c): c is string => typeof c === "string") : [];
    this.#colors = next.length > 0 ? next : COLORS;
  }

  protected render(): void {
    adoptStyles(confettiStyles);
    // 순수 장식 — 낭독기·포인터 양쪽에서 투명하다
    this.setAttribute("aria-hidden", "true");
    // 파티클은 여기서 만들지 않는다(§3.1-3). 입양된 잔재가 있으면 치운다
    if (this.childElementCount > 0) this.replaceChildren();
  }

  protected override connected(): void {
    this.#live = true;
    this.#motion ??= this.own(createReducedMotionWatcher());
    if (this.active) this.#start();
  }

  protected override disconnected(): void {
    this.#live = false;
    this.#motion = null; // own()이 이미 destroy했다
    this.#stop();
  }

  protected override update(): void {
    if (this.active === this.#wasActive) return;
    this.#wasActive = this.active;
    if (!this.#live) return; // 프리렌더 경로 — 난수를 쓰지 않는다
    if (this.active) this.#start();
    else this.#stop();
  }

  /** 명령형 1회 발사. active를 흔들 필요 없이 곧바로 터진다 */
  fire(): void {
    this.#wasActive = true;
    if (!this.active) this.active = true;
    if (this.#live) this.#start();
  }

  #start(): void {
    this.#stop();
    this.#running = true;
    this.toggleAttribute("data-running", true);
    // 감속 선호에서는 파티클 없이 시간만 흐른다 — jd-complete 계약은 동일하다(§개선 3)
    if (this.#motion?.get() !== true) this.#spawn();
    this.#timer = createTimeout(() => {
      this.#stop();
      this.emit("jd-complete");
    }, Math.max(0, this.duration));
  }

  #stop(): void {
    this.#timer?.destroy();
    this.#timer = null;
    if (!this.#running) return;
    this.#running = false;
    this.toggleAttribute("data-running", false);
    this.replaceChildren();
  }

  /** 난수를 쓰는 유일한 경로. connected() 이후에만 도달한다 */
  #spawn(): void {
    const doc = this.ownerDocument;
    const total = Math.min(MAX_COUNT, Math.max(1, Math.trunc(this.count) || 1));
    const fall = Math.max(0, this.duration);
    const colors = this.#colors;
    const frag = doc.createDocumentFragment();

    for (let i = 0; i < total; i++) {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)] ?? "square";
      const size = r1(6 + Math.random() * 6); // v2: 6~12px
      const piece = doc.createElement("div");
      piece.className = `${CLS}__piece`;
      piece.style.setProperty("--jd-confetti-x", `${r1(Math.random() * 100)}%`);
      piece.style.setProperty("--jd-confetti-delay", `${Math.round(Math.random() * 500)}ms`);
      piece.style.setProperty("--jd-confetti-fall", `${fall}ms`);

      const bit = doc.createElement("span");
      bit.className = `${CLS}__bit`;
      bit.dataset.shape = shape;
      bit.style.setProperty("--jd-confetti-w", `${shape === "strip" ? r1(size * 0.4) : size}px`);
      bit.style.setProperty("--jd-confetti-h", `${shape === "strip" ? r1(size * 1.5) : size}px`);
      const color = colors[Math.floor(Math.random() * colors.length)] ?? COLORS[0]!;
      bit.style.setProperty("--jd-confetti-color", color);
      bit.style.setProperty("--jd-confetti-rot", `${Math.round(Math.random() * 360)}deg`);
      bit.style.setProperty("--jd-confetti-spin", `${Math.round(600 + Math.random() * 400)}ms`);
      piece.append(bit);
      frag.append(piece);
    }
    this.append(frag);
  }
}
