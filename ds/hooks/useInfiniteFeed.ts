"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface InfiniteFeedPage<T> {
  /** 이번 페이지의 항목들 */
  items: T[];
  /** 다음 페이지 커서 (없으면 끝) */
  nextCursor?: string | number | null;
}

export interface UseInfiniteFeedOptions<T> {
  /** 한 페이지를 가져오는 함수 — cursor를 받아 결과 반환 */
  fetchPage: (cursor: string | number | null | undefined) => Promise<InfiniteFeedPage<T>>;
  /** 초기 자동 로드 (기본 true) */
  autoLoadInitial?: boolean;
  /** 항목 dedupe 키 (중복 방지) */
  getKey?: (item: T) => string;
}

export interface UseInfiniteFeedResult<T> {
  /** 누적된 항목들 */
  items: T[];
  /** 더 가져올 수 있는지 */
  hasMore: boolean;
  /** 현재 로딩 중인지 */
  loading: boolean;
  /** 마지막 에러 */
  error: Error | null;
  /** 다음 페이지 로드 (호출자가 트리거) */
  loadMore: () => Promise<void>;
  /** 처음부터 다시 로드 */
  reset: () => Promise<void>;
}

/**
 * 무한 피드 훅 — cursor 기반 페이지네이션 + 중복 dedupe + 동시 호출 가드.
 *
 * @example
 *   const feed = useInfiniteFeed<Post>({
 *     fetchPage: async (cursor) => {
 *       const r = await fetch(`/api/posts?cursor=${cursor ?? ""}`);
 *       const j = await r.json();
 *       return { items: j.posts, nextCursor: j.nextCursor };
 *     },
 *     getKey: (p) => p.id,
 *   });
 *   return <SocialFeed onLoadMore={feed.loadMore} hasMore={feed.hasMore} loading={feed.loading}>…</SocialFeed>;
 */
export function useInfiniteFeed<T>({
  fetchPage,
  autoLoadInitial = true,
  getKey,
}: UseInfiniteFeedOptions<T>): UseInfiniteFeedResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | number | null | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const inflight = useRef<Promise<void> | null>(null);
  const initialFired = useRef(false);
  const requestId = useRef(0);

  const loadMore = useCallback(async () => {
    if (inflight.current) return inflight.current;
    if (!hasMore && initialFired.current) return;
    setLoading(true);
    setError(null);
    const myId = ++requestId.current;
    const p = (async () => {
      try {
        const page = await fetchPage(cursor);
        if (myId !== requestId.current) return;
        setItems((prev) => {
          if (!getKey) return [...prev, ...page.items];
          const seen = new Set(prev.map(getKey));
          const fresh = page.items.filter((it) => !seen.has(getKey(it)));
          return [...prev, ...fresh];
        });
        setCursor(page.nextCursor ?? null);
        setHasMore(page.nextCursor != null);
      } catch (e) {
        if (myId === requestId.current) setError(e as Error);
      } finally {
        if (myId === requestId.current) setLoading(false);
        inflight.current = null;
      }
    })();
    inflight.current = p;
    initialFired.current = true;
    return p;
  }, [fetchPage, cursor, hasMore, getKey]);

  const reset = useCallback(async () => {
    requestId.current++;
    inflight.current = null;
    initialFired.current = false;
    setItems([]);
    setCursor(undefined);
    setHasMore(true);
    setError(null);
    await loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (!autoLoadInitial || initialFired.current) return;
    void loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, hasMore, loading, error, loadMore, reset };
}
