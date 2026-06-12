"use client";
import { useEffect, useState } from "react";

export interface WindowSize {
  width: number;
  height: number;
}

/**
 * 현재 window 크기. SSR-safe (마운트 전에는 0/0). resize 이벤트로 자동 갱신.
 *
 * @example
 *   const { width } = useWindowSize();
 *   const isMobile = width < 768;
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}
