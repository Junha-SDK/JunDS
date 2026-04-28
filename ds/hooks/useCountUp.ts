"use client";
import { useEffect, useState, useCallback } from "react";

export interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  enabled?: boolean;
}

/**
 * 숫자 카운트업 애니메이션 훅
 * @example
 * const { value } = useCountUp({ end: 1000, duration: 2000 });
 * <span>{value}</span>
 */
export function useCountUp({
  start = 0,
  end,
  duration = 2000,
  delay = 0,
  decimals = 0,
  enabled = true,
}: UseCountUpOptions) {
  const [value, setValue] = useState(start);
  const [isComplete, setIsComplete] = useState(false);

  const reset = useCallback(() => {
    setValue(start);
    setIsComplete(false);
  }, [start]);

  useEffect(() => {
    if (!enabled) return;

    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const diff = end - start;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = start + diff * eased;
        setValue(Number(current.toFixed(decimals)));

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setValue(Number(end.toFixed(decimals)));
          setIsComplete(true);
        }
      };

      requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timeout);
  }, [start, end, duration, delay, decimals, enabled]);

  return { value, isComplete, reset };
}
