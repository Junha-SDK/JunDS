"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 단일 리소스를 fetch하는 SWR-style 훅. 메모리 캐시 + revalidate + 에러
 * 핸들링. 외부 데이터 라이브러리(SWR/React Query) 없이 가벼운 fetch 패턴을
 * 표준화한다.
 *
 * @example
 *   const user = useResource(["user", userId], () => fetchUser(userId));
 *   if (user.loading) return <Spinner />;
 *   if (user.error) return <Alert variant="danger">{user.error.message}</Alert>;
 *   return <ProfileHeader name={user.data!.name} />;
 */

interface CacheEntry<T> {
  data?: T;
  error?: Error;
  ts: number;
  inflight?: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();
const subscribers = new Map<string, Set<() => void>>();

function notify(key: string) {
  subscribers.get(key)?.forEach((fn) => fn());
}

function subscribe(key: string, fn: () => void) {
  let set = subscribers.get(key);
  if (!set) {
    set = new Set();
    subscribers.set(key, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) subscribers.delete(key);
  };
}

export interface UseResourceOptions {
  /** 캐시 TTL (ms). 0이면 캐시 안 함, Infinity면 무한 (기본 30_000) */
  ttl?: number;
  /** 마운트 시 자동 fetch (기본 true) */
  enabled?: boolean;
  /** 윈도우 포커스 시 재검증 */
  revalidateOnFocus?: boolean;
}

export interface UseResourceResult<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
  /** 강제 재검증 */
  refresh: () => Promise<void>;
  /** 캐시된 data를 즉시 갱신 (옵티미스틱) */
  mutate: (next: T) => void;
}

function keyToString(key: unknown[]): string {
  return JSON.stringify(key);
}

/** 외부에서 캐시 무효화. 같은 key의 모든 구독자가 재검증 트리거. */
export function invalidateResource(key: unknown[]) {
  const k = keyToString(key);
  cache.delete(k);
  notify(k);
}

export function useResource<T>(
  key: unknown[],
  fetcher: () => Promise<T>,
  { ttl = 30_000, enabled = true, revalidateOnFocus = false }: UseResourceOptions = {},
): UseResourceResult<T> {
  const k = keyToString(key);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [, force] = useState(0);
  const tick = useCallback(() => force((n) => n + 1), []);

  const entry = cache.get(k) as CacheEntry<T> | undefined;
  const fresh = entry && Date.now() - entry.ts < ttl;

  const run = useCallback(async () => {
    const existing = cache.get(k) as CacheEntry<T> | undefined;
    if (existing?.inflight) return existing.inflight;
    const p = (async () => {
      try {
        const data = await fetcherRef.current();
        cache.set(k, { data, ts: Date.now() });
        notify(k);
        return data;
      } catch (e) {
        cache.set(k, { error: e as Error, ts: Date.now() });
        notify(k);
        throw e;
      }
    })();
    cache.set(k, { ...(existing ?? { ts: 0 }), inflight: p });
    try {
      return await p;
    } finally {
      const after = cache.get(k);
      if (after) cache.set(k, { ...after, inflight: undefined });
    }
  }, [k]);

  useEffect(() => {
    const unsub = subscribe(k, tick);
    if (enabled && (!entry || !fresh)) void run().catch(() => {});
    if (revalidateOnFocus && typeof window !== "undefined") {
      const onFocus = () => { void run().catch(() => {}); };
      window.addEventListener("focus", onFocus);
      return () => {
        unsub();
        window.removeEventListener("focus", onFocus);
      };
    }
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, enabled, ttl, revalidateOnFocus]);

  return {
    data: entry?.data,
    error: entry?.error,
    loading: !entry || (!entry.data && !entry.error) || !!entry.inflight,
    refresh: run as () => Promise<void>,
    mutate: (next: T) => {
      cache.set(k, { data: next, ts: Date.now() });
      notify(k);
    },
  };
}
