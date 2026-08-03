"use client";
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface VirtualListProps<T> {
  /** 렌더할 항목 배열 */
  items: T[];
  /** 항목 고정 높이(px) */
  itemHeight: number;
  /** 항목 렌더 함수 */
  renderItem: (item: T, index: number) => ReactNode;
  /** 키 추출 함수 */
  keyExtractor: (item: T) => string;
  /** 뷰포트 높이 */
  height: number;
  /** 오버스캔 행 수 */
  overscan?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 가상화 리스트 — 10,000+ 행도 부드럽게
 * @example
 * <VirtualList items={bigData} itemHeight={40} height={400} renderItem={(item)=><Row>{item.name}</Row>} keyExtractor={i=>i.id} />
 * @status stable
 * @since 2.2.0
 * @tags data
 */
export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  keyExtractor,
  height,
  overscan = 5,
  className,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(height / itemHeight);
  const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIdx = Math.min(items.length, startIdx + visibleCount + overscan * 2);
  const offsetY = startIdx * itemHeight;

  const handleScroll = useCallback(() => {
    if (containerRef.current) setScrollTop(containerRef.current.scrollTop);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div ref={containerRef} className={cn("overflow-auto", className)} style={{ height }}>
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {items.slice(startIdx, endIdx).map((item, i) => (
            <div key={keyExtractor(item)} style={{ height: itemHeight }}>
              {renderItem(item, startIdx + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
