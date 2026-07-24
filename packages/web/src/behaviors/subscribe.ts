/**
 * Watcher 공통 골격 — "현재값 + 구독 + 정리"를 갖는 Behavior의 최소 공통분모.
 *
 * v2 훅 55종 중 관찰자 계열은 전부 같은 모양이었다(useState + useEffect(구독) + 반환).
 * 바닐라에는 렌더 루프가 없으니 값을 밀어주는 쪽(subscribe)이 그 자리를 대신한다.
 * 03-web-arch §5.1 Behavior 규약의 destroy 멱등성을 여기서 한 번에 보장한다.
 */
import type { Behavior } from "./types.js";

export interface Watcher<T> extends Behavior {
  /** 현재값 */
  get(): T;
  /** 변경 구독. 반환값을 호출하면 해당 구독만 해제 */
  subscribe(fn: (value: T) => void): () => void;
}

export interface WatcherInternals<T> {
  set(value: T): void;
  watcher: Watcher<T>;
}

/**
 * 구독자 관리 + destroy 멱등을 제공하는 내부 헬퍼.
 * `start`는 첫 구독이 아니라 생성 시점에 호출된다 — v2 훅이 마운트 즉시 관찰을
 * 시작하던 것과 같은 시점이며, 지연 시작이 필요한 것은 activate/deactivate를 따로 낸다.
 */
export function createWatcher<T>(
  initial: T,
  start: (set: (v: T) => void) => (() => void) | void,
): Watcher<T> {
  let value = initial;
  let destroyed = false;
  const subs = new Set<(v: T) => void>();

  const set = (next: T): void => {
    if (destroyed || Object.is(next, value)) return;
    value = next;
    for (const fn of subs) fn(next);
  };

  const stop = start(set) ?? undefined;

  return {
    get: () => value,
    subscribe(fn) {
      if (destroyed) return () => {};
      subs.add(fn);
      return () => subs.delete(fn);
    },
    destroy() {
      if (destroyed) return; // 멱등
      destroyed = true;
      subs.clear();
      stop?.();
    },
  };
}
