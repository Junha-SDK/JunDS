/**
 * 타이밍 계열 (v2 useDebounce·useThrottle·useInterval·useTimeout·useIdle·
 * useAnimationFrame·useCountUp).
 *
 * v2의 useDebounce는 "값"을 지연시키는 훅이었지만(렌더 결과를 늦추는 React 관용구),
 * 바닐라에는 그 자리가 없다 — **함수**를 지연시키는 표준형 debounce로 낸다.
 * 00-inventory §4 매핑표도 `debounce(fn, ms)` 순수 유틸로 못박고 있다.
 */
import type { Behavior } from "./types.js";

export interface Cancellable {
  /** 대기 중인 호출 취소 */
  cancel(): void;
}

/** 마지막 호출만 ms 후에 실행 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms = 300,
): ((...args: A) => void) & Cancellable {
  let id: ReturnType<typeof setTimeout> | undefined;
  const wrapped = (...args: A): void => {
    if (id) clearTimeout(id);
    id = setTimeout(() => {
      id = undefined;
      fn(...args);
    }, ms);
  };
  wrapped.cancel = (): void => {
    if (id) clearTimeout(id);
    id = undefined;
  };
  return wrapped;
}

/** 선행 실행 + 남은 간격 뒤 후행 1회 (v2 useThrottle 알고리즘 이식) */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  ms = 300,
): ((...args: A) => void) & Cancellable {
  let last = 0;
  let id: ReturnType<typeof setTimeout> | undefined;
  const wrapped = (...args: A): void => {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (id) clearTimeout(id);
    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else {
      id = setTimeout(() => {
        last = Date.now();
        id = undefined;
        fn(...args);
      }, remaining);
    }
  };
  wrapped.cancel = (): void => {
    if (id) clearTimeout(id);
    id = undefined;
  };
  return wrapped;
}

export interface Timer extends Behavior {
  /** 즉시 정지 (destroy 별칭 — 의도를 드러내는 이름) */
  stop(): void;
  /** 처음부터 다시 시작 */
  restart(): void;
}

export function createInterval(fn: () => void, ms: number): Timer {
  let id: ReturnType<typeof setInterval> | undefined = setInterval(fn, ms);
  const stop = (): void => {
    if (id) clearInterval(id);
    id = undefined;
  };
  return {
    stop,
    restart() {
      stop();
      id = setInterval(fn, ms);
    },
    destroy: stop, // 멱등 — clearInterval(undefined)은 무해
  };
}

export function createTimeout(fn: () => void, ms: number): Timer {
  let id: ReturnType<typeof setTimeout> | undefined = setTimeout(fn, ms);
  const stop = (): void => {
    if (id) clearTimeout(id);
    id = undefined;
  };
  return {
    stop,
    restart() {
      stop();
      id = setTimeout(fn, ms);
    },
    destroy: stop,
  };
}

export interface RafLoop extends Behavior {
  start(): void;
  stop(): void;
}

/** delta·total(ms)을 주는 rAF 루프 (v2 useAnimationFrame) */
export function createRafLoop(cb: (deltaMs: number, totalMs: number) => void): RafLoop {
  let raf = 0;
  let running = false;
  let startedAt = 0;
  let last = 0;
  const loop = (now: number): void => {
    cb(now - last, now - startedAt);
    last = now;
    raf = requestAnimationFrame(loop);
  };
  return {
    start() {
      if (running || typeof requestAnimationFrame === "undefined") return;
      running = true;
      startedAt = last = performance.now();
      raf = requestAnimationFrame(loop);
    },
    stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    },
    destroy() {
      this.stop();
    },
  };
}

export interface IdleOptions {
  /** 무활동 판정 시간(ms). v2 기본 60초 */
  timeout?: number;
  /** 감시 대상. 기본 document */
  target?: Document | HTMLElement;
}

/** 무활동 감시 — 활동 이벤트가 끊기면 true (v2 useIdle) */
export function createIdleWatcher(opts: IdleOptions = {}): Behavior & {
  get(): boolean;
  subscribe(fn: (idle: boolean) => void): () => void;
} {
  const timeout = opts.timeout ?? 60_000;
  const target = opts.target ?? (typeof document !== "undefined" ? document : null);
  let idle = false;
  let id: ReturnType<typeof setTimeout> | undefined;
  let destroyed = false;
  const subs = new Set<(idle: boolean) => void>();

  const set = (next: boolean): void => {
    if (destroyed || next === idle) return;
    idle = next;
    for (const fn of subs) fn(next);
  };
  const arm = (): void => {
    if (id) clearTimeout(id);
    id = setTimeout(() => set(true), timeout);
  };
  const onActivity = (): void => {
    set(false);
    arm();
  };

  const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
  if (target) {
    for (const e of EVENTS) target.addEventListener(e, onActivity, { passive: true });
    arm();
  }

  return {
    get: () => idle,
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      subs.clear();
      if (id) clearTimeout(id);
      if (target) for (const e of EVENTS) target.removeEventListener(e, onActivity);
    },
  };
}

export interface CountUpOptions {
  start?: number;
  end: number;
  /** ms. v2 기본 2000 */
  duration?: number;
  delay?: number;
  decimals?: number;
  /** 표기 변환. 기본은 toFixed(decimals) */
  format?: (value: number) => string;
}

/**
 * 숫자 카운트업 (v2 useCountUp). 이징은 v2 easeOutExpo 그대로.
 * 요소의 textContent를 직접 갱신하는 Behavior — 값 구독이 아니라 DOM 반영이 목적이다.
 */
export function createCountUp(el: Element, opts: CountUpOptions): Behavior & { restart(): void } {
  const start = opts.start ?? 0;
  const duration = opts.duration ?? 2000;
  const decimals = opts.decimals ?? 0;
  const fmt = opts.format ?? ((v: number) => v.toFixed(decimals));
  let raf = 0;
  let delayId: ReturnType<typeof setTimeout> | undefined;
  let destroyed = false;

  const run = (): void => {
    if (destroyed || typeof requestAnimationFrame === "undefined") return;
    const t0 = performance.now();
    const diff = opts.end - start;
    const step = (now: number): void => {
      if (destroyed) return;
      const p = Math.min((now - t0) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // v2 easeOutExpo
      el.textContent = fmt(start + diff * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else el.textContent = fmt(opts.end);
    };
    raf = requestAnimationFrame(step);
  };

  const begin = (): void => {
    el.textContent = fmt(start);
    if (opts.delay) delayId = setTimeout(run, opts.delay);
    else run();
  };
  begin();

  return {
    restart() {
      if (raf) cancelAnimationFrame(raf);
      if (delayId) clearTimeout(delayId);
      begin();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      if (delayId) clearTimeout(delayId);
    },
  };
}
