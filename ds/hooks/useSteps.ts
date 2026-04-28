"use client";
import { useState, useCallback, useMemo } from "react";

export interface UseStepsReturn {
  current: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  progress: number;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

export function useSteps(total: number, initial: number = 0): UseStepsReturn {
  const [current, setCurrent] = useState(initial);

  const next = useCallback(() => setCurrent((s) => Math.min(s + 1, total - 1)), [total]);
  const prev = useCallback(() => setCurrent((s) => Math.max(s - 1, 0)), []);
  const goTo = useCallback((step: number) => setCurrent(Math.max(0, Math.min(step, total - 1))), [total]);
  const reset = useCallback(() => setCurrent(initial), [initial]);

  return useMemo(() => ({
    current,
    total,
    isFirst: current === 0,
    isLast: current === total - 1,
    progress: total > 1 ? current / (total - 1) : 1,
    next,
    prev,
    goTo,
    reset,
  }), [current, total, next, prev, goTo, reset]);
}
