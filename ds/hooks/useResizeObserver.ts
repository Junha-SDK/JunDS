"use client";
import { useEffect, useState, type RefObject } from "react";

export interface ResizeObserverEntry2 {
  width: number;
  height: number;
  top: number;
  left: number;
}

/**
 * ResizeObserver 기반 요소 크기 추적 (border-box 기준).
 * useElementSize 보다 풍부한 정보 제공 (DOMRect 전체).
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const rect = useResizeObserver(ref);
 * if (rect) console.log(rect.width);
 */
export function useResizeObserver<T extends HTMLElement>(
  ref: RefObject<T | null>,
): ResizeObserverEntry2 | null {
  const [rect, setRect] = useState<ResizeObserverEntry2 | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const r = e.target.getBoundingClientRect();
        setRect({ width: r.width, height: r.height, top: r.top, left: r.left });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return rect;
}
