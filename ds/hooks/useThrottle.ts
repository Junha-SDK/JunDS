"use client";
import { useRef, useCallback } from "react";

export function useThrottle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  const lastCall = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return useCallback((...args: unknown[]) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall.current);
    clearTimeout(timeoutRef.current);
    if (remaining <= 0) {
      lastCall.current = now;
      fn(...args);
    } else {
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        fn(...args);
      }, remaining);
    }
  }, [fn, delay]) as T;
}
