/**
 * 데이터 계열 (v2 useResource·useMutation).
 *
 * v2 useResource는 모듈 전역 Map 캐시 + 구독으로 이미 프레임워크 중립이었다 —
 * React 부분(useState 강제 리렌더)만 걷어내면 그대로 바닐라 스토어가 된다.
 */
import type { Behavior } from "./types.js";

interface CacheEntry<T> {
  data?: T;
  error?: Error;
  /** 적재 시각(ms) */
  ts: number;
  inflight?: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();
const listeners = new Map<string, Set<() => void>>();

function notify(key: string): void {
  for (const fn of listeners.get(key) ?? []) fn();
}

export interface ResourceState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

export interface Resource<T> extends Behavior {
  /** 현재 상태(캐시 히트면 즉시 값) */
  read(): ResourceState<T>;
  /** 캐시를 버리고 다시 가져온다 */
  invalidate(): Promise<void>;
  subscribe(fn: (state: ResourceState<T>) => void): () => void;
}

export interface ResourceOptions {
  /** 신선도(ms). v2 기본 30초 */
  ttl?: number;
}

export function createResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: ResourceOptions = {},
): Resource<T> {
  const ttl = opts.ttl ?? 30_000;
  const subs = new Set<(s: ResourceState<T>) => void>();

  const state = (): ResourceState<T> => {
    const e = cache.get(key) as CacheEntry<T> | undefined;
    return { data: e?.data, error: e?.error, loading: Boolean(e?.inflight) };
  };

  const run = (): Promise<T> => {
    const existing = cache.get(key) as CacheEntry<T> | undefined;
    if (existing?.inflight) return existing.inflight; // 중복 요청 합류
    const p = (async () => {
      try {
        const data = await fetcher();
        cache.set(key, { data, ts: Date.now() });
        return data;
      } catch (err) {
        cache.set(key, { error: err as Error, ts: Date.now() });
        throw err;
      } finally {
        notify(key);
      }
    })();
    cache.set(key, { ...(existing ?? { ts: 0 }), inflight: p });
    notify(key);
    return p;
  };

  const onNotify = (): void => {
    const s = state();
    for (const fn of subs) fn(s);
  };
  let set = listeners.get(key);
  if (!set) listeners.set(key, (set = new Set()));
  set.add(onNotify);

  // 캐시가 없거나 상했으면 즉시 가져온다 — 실패는 상태로 흡수(전역 rejection 금지)
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry || (Date.now() - entry.ts >= ttl && !entry.inflight)) {
    run().catch(() => {});
  }

  let destroyed = false;
  return {
    read: state,
    async invalidate() {
      cache.delete(key);
      await run().catch(() => {});
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      subs.clear();
      listeners.get(key)?.delete(onNotify);
    },
  };
}

/** 테스트·로그아웃 등에서 전체 캐시를 비운다 */
export function clearResourceCache(): void {
  cache.clear();
}

export interface MutationCallbacks<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

/**
 * 단발 변이 실행 (v2 useMutation의 상태 없는 형태).
 * 성공/실패를 콜백으로 알리고 **던지지 않는다** — 호출부가 try/catch를 잊어
 * unhandled rejection이 나는 것을 막는다(DEC-029-7과 같은 판단).
 */
export async function runMutation<T>(
  fn: () => Promise<T>,
  cbs: MutationCallbacks<T> = {},
): Promise<{ ok: true; data: T } | { ok: false; error: Error }> {
  try {
    const data = await fn();
    cbs.onSuccess?.(data);
    return { ok: true, data };
  } catch (err) {
    const error = err as Error;
    cbs.onError?.(error);
    return { ok: false, error };
  } finally {
    cbs.onSettled?.();
  }
}
