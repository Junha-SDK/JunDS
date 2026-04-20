"use client";
import { useState, useEffect } from "react";

/**
 * prefers-reduced-motion 감지
 * @example
 * const reduced = useReducedMotion();
 * if (reduced) { // skip animation }
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
