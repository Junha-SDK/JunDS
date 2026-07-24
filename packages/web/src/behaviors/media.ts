/**
 * 미디어 질의 계열 Behavior (v2 useMediaQuery·useBreakpoint·useBreakpointValue·
 * usePrefersColorScheme·useReducedMotion — 00-inventory §4 매핑표).
 *
 * v2는 5개 훅이 각자 matchMedia를 열었지만 실체는 하나다 — 브레이크포인트·색 구성·
 * 감속 선호가 전부 미디어 질의 관찰이다. createMediaQueryWatcher 하나를 두고
 * 나머지는 그 파생으로 만든다(중복 통합, §6 R12와 같은 원칙).
 *
 * 초기값은 **구독 시작 시점에 즉시 실측**한다. v2는 useState(false)로 시작해
 * 이펙트에서 교정했는데, 그건 React 렌더 사이클 때문이지 의미상 필요한 게 아니다.
 */
import { BREAKPOINTS } from "../core/style-props.js";
import { createWatcher, type Watcher } from "./subscribe.js";

/** SSR·구형 환경 안전 — matchMedia 부재 시 항상 false인 정적 워처 */
function staticWatcher<T>(value: T): Watcher<T> {
  return { get: () => value, subscribe: () => () => {}, destroy: () => {} };
}

export function createMediaQueryWatcher(query: string): Watcher<boolean> {
  if (typeof window === "undefined" || !window.matchMedia) return staticWatcher(false);
  const mql = window.matchMedia(query);
  return createWatcher(mql.matches, (set) => {
    const on = (e: MediaQueryListEvent): void => set(e.matches);
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  });
}

export type JdBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

/** 큰 것부터 — 첫 일치가 현재 브레이크포인트 */
const BP_ORDER: JdBreakpoint[] = ["2xl", "xl", "lg", "md"];

/**
 * 현재 브레이크포인트. v2는 resize마다 innerWidth를 읽었지만 여기서는 질의 4개를
 * 겹쳐 쓴다 — 리사이즈 폭풍에도 브라우저가 변화 시점만 알려준다(리스너 1/n).
 */
export function createBreakpointObserver(): Watcher<JdBreakpoint> {
  if (typeof window === "undefined" || !window.matchMedia) return staticWatcher<JdBreakpoint>("lg");
  const mqls = BP_ORDER.map((bp) => window.matchMedia(`(min-width: ${BREAKPOINTS[bp]}px)`));
  const current = (): JdBreakpoint => {
    for (let i = 0; i < mqls.length; i++) if (mqls[i]!.matches) return BP_ORDER[i]!;
    return "sm"; // v2 동형 — md 미만은 전부 sm
  };
  return createWatcher(current(), (set) => {
    const on = (): void => set(current());
    for (const m of mqls) m.addEventListener("change", on);
    return () => {
      for (const m of mqls) m.removeEventListener("change", on);
    };
  });
}

/** v2 useBreakpointValue — 지정 브레이크포인트 이상인가 */
export function createBreakpointValueWatcher(min: JdBreakpoint): Watcher<boolean> {
  return createMediaQueryWatcher(`(min-width: ${BREAKPOINTS[min]}px)`);
}

/** 브레이크포인트 → 값 맵 해석. 현재 이하에서 가장 큰 정의값을 고른다 */
export function resolveBreakpointValue<T>(
  map: Partial<Record<JdBreakpoint | "base", T>>,
  current: JdBreakpoint,
): T | undefined {
  const chain: (JdBreakpoint | "base")[] = ["2xl", "xl", "lg", "md", "sm", "base"];
  const from = chain.indexOf(current);
  for (let i = from < 0 ? 0 : from; i < chain.length; i++) {
    const v = map[chain[i]!];
    if (v !== undefined) return v;
  }
  return undefined;
}

export type JdColorScheme = "light" | "dark";

export function createColorSchemeWatcher(): Watcher<JdColorScheme> {
  const mq = createMediaQueryWatcher("(prefers-color-scheme: dark)");
  return {
    get: () => (mq.get() ? "dark" : "light"),
    subscribe: (fn) => mq.subscribe((dark) => fn(dark ? "dark" : "light")),
    destroy: () => mq.destroy(),
  };
}

export function createReducedMotionWatcher(): Watcher<boolean> {
  return createMediaQueryWatcher("(prefers-reduced-motion: reduce)");
}
