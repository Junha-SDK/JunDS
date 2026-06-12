"use client";
import { useEffect, useRef } from "react";

/**
 * 매 frame마다 callback 실행. start/stop 자동 cleanup. `useReducedMotion`
 * 환경에서는 자동으로 비활성화 (선택적).
 *
 * @example
 *   const elapsed = useRef(0);
 *   useAnimationFrame((dt) => {
 *     elapsed.current += dt;
 *     setProgress(Math.min(1, elapsed.current / duration));
 *   }, { enabled: !reduced });
 */

export interface UseAnimationFrameOptions {
  /** false면 정지 (기본 true) */
  enabled?: boolean;
}

export function useAnimationFrame(
  callback: (deltaMs: number, totalMs: number) => void,
  { enabled = true }: UseAnimationFrameOptions = {},
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    let raf = 0;
    let last = performance.now();
    const start = last;
    const loop = (now: number) => {
      cbRef.current(now - last, now - start);
      last = now;
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [enabled]);
}
