"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
}

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
