/**
 * <jd-starfield> — Canvas 별 배경 애니메이션 (v2 patterns/Starfield).
 * 반짝이는 별 + 유성, requestAnimationFrame 루프.
 *
 * v2 대비:
 *  - 랜덤·rAF는 전부 connected() 이후에 시작한다 — render()는 <canvas> 골격만 만들어
 *    프리렌더 스냅샷이 결정적(§3.1-3, SSG 규범).
 *  - 리사이즈는 window가 아니라 **호스트 크기**를 ResizeObserver로 관찰(createSizeObserver) —
 *    부모 레이아웃 변화에도 반응한다(v2는 window resize만).
 *  - `prefers-reduced-motion`을 존중: 모션 감축이면 루프를 멈추고 정적 별밭 1프레임만 그린다
 *    (createReducedMotionWatcher, §8). 탭이 숨으면 rAF는 브라우저가 알아서 멈춘다.
 *  - 애니메이션 루프는 createRafLoop Behavior로 소유 → disconnected 시 자동 정리(§5.1).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createRafLoop, type RafLoop } from "../../behaviors/timing.js";
import { createSizeObserver } from "../../behaviors/viewport.js";
import { createReducedMotionWatcher } from "../../behaviors/media.js";
import type { Watcher } from "../../behaviors/subscribe.js";
import starfieldStyles from "./starfield.css.js";

const TWO_PI = Math.PI * 2;
const COLORS = ["#fff", "#fff", "#fff", "#ffeedd", "#dde8ff", "#cce0ff"];

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
  color: string;
  bright: boolean;
}

interface Shooting {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
}

export class JdStarfield extends JdElement {
  static override tag = "jd-starfield";
  static override props = {
    starCount: { type: Number, default: 220 },
    shootingStarInterval: { type: Number, default: 5 }, // 초
    backgroundColor: { type: String, default: "#0b0d1a" },
  };

  declare starCount: number;
  declare shootingStarInterval: number;
  declare backgroundColor: string;

  #canvas!: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D | null = null;
  #dpr = 1;
  #w = 0;
  #h = 0;
  #t = 0;
  #lastShoot = 0;
  #stars: Star[] = [];
  #shootings: Shooting[] = [];
  #loop: RafLoop | null = null;
  #motion: Watcher<boolean> | null = null;
  #lastCount = -1;

  protected render(): void {
    adoptStyles(starfieldStyles);
    this.#canvas =
      this.querySelector<HTMLCanvasElement>(":scope > canvas.jd-starfield__canvas") ??
      this.#buildCanvas();
    this.update();
  }

  #buildCanvas(): HTMLCanvasElement {
    const c = document.createElement("canvas");
    c.className = "jd-starfield__canvas";
    this.append(c);
    return c;
  }

  protected override update(): void {
    // 배경색은 호스트 인라인 — 캔버스가 클리어된 틈에도 어둠이 유지된다
    this.style.setProperty("--jd-starfield-bg", this.backgroundColor);
    // starCount가 런타임에 바뀌면 별밭을 다시 채운다(연결 이후에만; ctx 준비 후)
    if (this.#ctx && this.starCount !== this.#lastCount) {
      this.#lastCount = this.starCount;
      this.#initStars();
      this.#resize();
    }
  }

  protected connected(): void {
    // happy-dom 등 비-브라우저 환경은 getContext가 null이거나 throw할 수 있다 — 애니메이션만 건너뛴다
    try {
      this.#ctx = this.#canvas.getContext("2d");
    } catch {
      this.#ctx = null;
    }
    if (!this.#ctx) return;
    this.#dpr = window.devicePixelRatio || 1;
    this.#initStars();
    this.#lastCount = this.starCount;
    this.#resize();

    this.#loop = this.own(createRafLoop((_d, total) => this.#draw(total)));
    this.own(createSizeObserver(this, () => this.#resize()));

    // 모션 감축 존중 — 켜져 있으면 정적 1프레임, 아니면 루프
    this.#motion = this.own(createReducedMotionWatcher());
    this.#motion.subscribe((reduced) => this.#applyMotion(reduced));
    this.#applyMotion(this.#motion.get());
  }

  #applyMotion(reduced: boolean): void {
    if (!this.#loop) return;
    if (reduced) {
      this.#loop.stop();
      this.#drawStatic();
    } else {
      this.#loop.start();
    }
  }

  #initStars(): void {
    const stars: Star[] = [];
    const count = Math.max(0, Math.floor(this.starCount));
    for (let i = 0; i < count; i++) {
      const bright = Math.random() < 0.05;
      stars.push({
        x: 0,
        y: 0,
        r: bright ? Math.random() * 1.0 + 1.2 : Math.random() * 1.2 + 0.15,
        a: bright ? Math.random() * 0.25 + 0.55 : Math.random() * 0.4 + 0.08,
        phase: Math.random() * TWO_PI,
        speed: Math.random() * 0.4 + 0.7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        bright,
      });
    }
    this.#stars = stars;
  }

  #resize(): void {
    const canvas = this.#canvas;
    const ctx = this.#ctx;
    if (!ctx) return;
    this.#w = this.clientWidth || this.offsetWidth || window.innerWidth;
    this.#h = this.clientHeight || this.offsetHeight || window.innerHeight;
    canvas.width = Math.max(1, this.#w * this.#dpr);
    canvas.height = Math.max(1, this.#h * this.#dpr);
    canvas.style.width = `${this.#w}px`;
    canvas.style.height = `${this.#h}px`;
    ctx.setTransform(this.#dpr, 0, 0, this.#dpr, 0, 0);
    for (const s of this.#stars) {
      s.x = Math.random() * this.#w;
      s.y = Math.random() * this.#h;
    }
    // 정적 모드면 리사이즈 후 다시 한 번 그린다
    if (this.#motion?.get()) this.#drawStatic();
  }

  /** 정적 별밭 — 반짝임/유성 없이 1프레임 */
  #drawStatic(): void {
    const ctx = this.#ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.#w, this.#h);
    for (const s of this.#stars) {
      ctx.globalAlpha = s.a * 0.8;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TWO_PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  #draw(now: number): void {
    const ctx = this.#ctx;
    if (!ctx) return;
    const w = this.#w;
    const h = this.#h;
    ctx.clearRect(0, 0, w, h);
    this.#t += 0.01;

    /* 별 */
    for (const s of this.#stars) {
      const tw = Math.sin(this.#t * s.speed + s.phase);
      const alpha = s.a * (tw * 0.2 + 0.8);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TWO_PI);
      ctx.fill();

      if (s.bright) {
        ctx.globalAlpha = alpha * 0.35;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 0.5;
        const l = s.r * 3;
        ctx.beginPath();
        ctx.moveTo(s.x - l, s.y);
        ctx.lineTo(s.x + l, s.y);
        ctx.moveTo(s.x, s.y - l);
        ctx.lineTo(s.x, s.y + l);
        ctx.stroke();
      }
    }

    /* 유성 */
    const intervalMs = Math.max(0, this.shootingStarInterval) * 1000;
    if (now - this.#lastShoot > intervalMs) {
      const left = Math.random() > 0.5;
      this.#shootings.push({
        x: left ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
        y: Math.random() * h * 0.4,
        vx: (left ? 1 : -1) * (Math.random() * 3 + 5),
        vy: Math.random() * 1.5 + 1.5,
        life: 0,
        max: Math.random() * 25 + 25,
        size: Math.random() * 1 + 0.8,
      });
      this.#lastShoot = now;
    }

    for (let i = this.#shootings.length - 1; i >= 0; i--) {
      const s = this.#shootings[i]!;
      s.x += s.vx;
      s.y += s.vy;
      s.life++;
      const p = s.life / s.max;
      if (p >= 1) {
        this.#shootings.splice(i, 1);
        continue;
      }
      const a = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
      ctx.globalAlpha = a * 0.8;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = s.size;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 5, s.y - s.vy * 5);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  protected disconnected(): void {
    // own() 등록분(loop·observer·watcher)은 베이스가 destroy — 참조만 비운다
    this.#loop = null;
    this.#motion = null;
    this.#shootings = [];
  }
}
