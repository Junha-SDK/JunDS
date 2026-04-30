"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface VirtualScrollProps<T> {
  /** 렌더링할 항목 배열 */
  items: T[];
  /** 항목 고정 높이(px) */
  itemHeight: number;
  /** 항목 렌더 함수 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 뷰포트 외 추가 렌더 개수 */
  overscan?: number;
  /** 추가 클래스 */
  className?: string;
  /** 추가 스타일 */
  style?: React.CSSProperties;
}

/**
 * 대량 리스트를 가상화로 렌더링하는 스크롤러.
 * @example
 * <VirtualScroll
 *   items={items}
 *   itemHeight={48}
 *   renderItem={(item) => <Row item={item} />}
 * />
 * @status stable
 * @since 2.2.0
 * @tags data
 */
export function VirtualScroll<T>({
  items, itemHeight, renderItem, overscan = 5, className, style,
}: VirtualScrollProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerHeight(el.clientHeight);
    const observer = new ResizeObserver(([entry]) => setContainerHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) setScrollTop(containerRef.current.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIdx = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
  const visibleItems = items.slice(startIdx, endIdx);

  return (
    <div ref={containerRef} onScroll={handleScroll} className={cn("overflow-auto", className)} style={style}>
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item, i) => (
          <div
            key={startIdx + i}
            style={{ position: "absolute", top: (startIdx + i) * itemHeight, width: "100%", height: itemHeight }}
          >
            {renderItem(item, startIdx + i)}
          </div>
        ))}
      </div>
    </div>
  );
}
