"use client";
import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Spinner } from "../../primitives/Spinner";

export interface InfiniteListProps<T> {
  /** 항목 배열 */
  items: T[];
  /** 항목 렌더 함수 */
  renderItem: (item: T, index: number) => ReactNode;
  /** 키 추출 함수 */
  keyExtractor: (item: T) => string;
  /** 추가 로드 콜백 */
  onLoadMore: () => void;
  /** 더 불러올 항목 존재 여부 */
  hasMore: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 트리거 거리 (px) */
  threshold?: number;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 무한 스크롤 리스트 (IntersectionObserver)
 * @example
 * <InfiniteList items={data} renderItem={(item)=><Card>{item.name}</Card>} keyExtractor={i=>i.id} onLoadMore={fetchMore} hasMore={hasNext} />
 * @status stable
 * @since 2.2.0
 * @tags data
 */
export function InfiniteList<T>({
  items,
  renderItem,
  keyExtractor,
  onLoadMore,
  hasMore,
  loading,
  threshold = 100,
  emptyMessage = "항목이 없습니다",
  className,
}: InfiniteListProps<T>) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: `0px 0px ${threshold}px 0px`,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect, threshold]);

  if (items.length === 0 && !loading) {
    return <div className="py-12 text-center text-sm text-muted">{emptyMessage}</div>;
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {items.map((item, i) => (
        <div key={keyExtractor(item)}>{renderItem(item, i)}</div>
      ))}
      {/* Sentinel */}
      <div ref={sentinelRef} className="h-1" />
      {loading && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <div className="py-4 text-center text-xs text-muted-light">모두 불러왔습니다</div>
      )}
    </div>
  );
}
