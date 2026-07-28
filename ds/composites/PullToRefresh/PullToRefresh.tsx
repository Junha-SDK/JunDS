"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface PullToRefreshProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 새로고침 트리거 콜백 */
  onRefresh: () => Promise<void>;
  /** 새로고침 임계 거리(px) */
  threshold?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 아래로 당겨서 새로고침하는 인터랙션 래퍼.
 * @example
 * <PullToRefresh onRefresh={async () => await reload()}>
 *   <List />
 * </PullToRefresh>
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export function PullToRefresh({
  children,
  onRefresh,
  threshold = 60,
  className,
}: PullToRefreshProps) {
  const [pulling, setPulling] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (refreshing || !containerRef.current || containerRef.current.scrollTop > 0) return;
      const delta = Math.max(0, (e.touches[0].clientY - startY.current) * 0.4);
      setPulling(Math.min(delta, threshold * 1.5));
    },
    [refreshing, threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (pulling >= threshold && !refreshing) {
      setRefreshing(true);
      setPulling(threshold);
      await onRefresh();
      setRefreshing(false);
    }
    setPulling(0);
  }, [pulling, threshold, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      // 당김 제스처가 브라우저 바깥 스크롤로 새지 않게 막는다.
      className={cn("overflow-auto overscroll-y-contain", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        // 여기서 변하는 건 높이와 투명도 둘뿐이다 — `all` 이면 자식 SVG 색까지 전이 대상이 된다.
        className="flex justify-center overflow-hidden transition-[height,opacity] duration-150 ease-out motion-reduce:transition-none"
        style={{ height: pulling, opacity: pulling / threshold }}
      >
        <svg
          className={cn(
            "w-5 h-5 text-primary-ink mt-2",
            refreshing && "animate-spin motion-reduce:animate-none",
          )}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
      {children}
    </div>
  );
}
