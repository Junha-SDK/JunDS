/**
 * 뷰포트·연결 상태 관찰자 (v2 useWindowSize·useWindowScroll·useNetworkStatus·
 * useElementSize/useResizeObserver·useIntersectionObserver).
 *
 * 스크롤·리사이즈 리스너는 전부 passive — 메인 스레드 스크롤을 막지 않는다(05-perf).
 * ResizeObserver/IntersectionObserver 부재 환경에서는 정적 워처로 떨어져
 * 호출부가 분기하지 않아도 되게 한다.
 */
import { createWatcher, type Watcher } from "./subscribe.js";
import type { Behavior } from "./types.js";

export interface JdSize {
  width: number;
  height: number;
}
export interface JdScrollPosition {
  x: number;
  y: number;
}

export function createWindowSizeWatcher(): Watcher<JdSize> {
  if (typeof window === "undefined") return staticSize();
  const read = (): JdSize => ({ width: window.innerWidth, height: window.innerHeight });
  let last = read();
  return createWatcher(last, (set) => {
    const on = (): void => {
      const next = read();
      // 객체는 매번 새로 만들어져 Object.is가 항상 false — 값 비교를 직접 한다
      if (next.width === last.width && next.height === last.height) return;
      last = next;
      set(next);
    };
    window.addEventListener("resize", on, { passive: true });
    return () => window.removeEventListener("resize", on);
  });
}

function staticSize(): Watcher<JdSize> {
  const v = { width: 0, height: 0 };
  return { get: () => v, subscribe: () => () => {}, destroy: () => {} };
}

export function createScrollWatcher(): Watcher<JdScrollPosition> {
  if (typeof window === "undefined") {
    const v = { x: 0, y: 0 };
    return { get: () => v, subscribe: () => () => {}, destroy: () => {} };
  }
  const read = (): JdScrollPosition => ({ x: window.scrollX, y: window.scrollY });
  let last = read();
  return createWatcher(last, (set) => {
    const on = (): void => {
      const next = read();
      if (next.x === last.x && next.y === last.y) return;
      last = next;
      set(next);
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  });
}

export interface JdNetworkStatus {
  online: boolean;
  /** 마지막 전환 시각(ms). 최초 관찰 시점에는 null */
  since: number | null;
}

export function createNetworkWatcher(): Watcher<JdNetworkStatus> {
  const online = typeof navigator === "undefined" ? true : navigator.onLine;
  return createWatcher<JdNetworkStatus>({ online, since: null }, (set) => {
    if (typeof window === "undefined") return;
    // Date.now()는 이벤트 시점 호출이라 렌더 결정성(§3.1-3)과 무관하다
    const go = (state: boolean) => (): void => set({ online: state, since: Date.now() });
    const on = go(true);
    const off = go(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  });
}

/** v2 useElementSize = useResizeObserver 통합 구현 (00-inventory §4 중복 통합) */
export function createSizeObserver(
  el: Element,
  onResize: (size: JdSize) => void,
): Behavior {
  if (typeof ResizeObserver === "undefined") return { destroy: () => {} };
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const r = e.contentRect;
      onResize({ width: r.width, height: r.height });
    }
  });
  ro.observe(el);
  let destroyed = false;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      ro.disconnect();
    },
  };
}

export interface InViewOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  /** 최초 진입 후 관찰 중단 */
  once?: boolean;
}

export function createInViewObserver(
  el: Element,
  onChange: (inView: boolean, entry: IntersectionObserverEntry) => void,
  opts: InViewOptions = {},
): Behavior {
  if (typeof IntersectionObserver === "undefined") return { destroy: () => {} };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        onChange(e.isIntersecting, e);
        if (opts.once && e.isIntersecting) io.unobserve(el);
      }
    },
    { root: opts.root ?? null, rootMargin: opts.rootMargin ?? "0px", threshold: opts.threshold ?? 0 },
  );
  io.observe(el);
  let destroyed = false;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      io.disconnect();
    },
  };
}
