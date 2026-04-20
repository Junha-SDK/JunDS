"use client";
import { useState, useEffect } from "react";
import { breakpoints, type Breakpoint } from "../tokens/breakpoints";

/**
 * 현재 뷰포트의 브레이크포인트 반환
 * @example
 * const bp = useBreakpoint(); // "sm" | "md" | "lg" | "xl" | "2xl"
 * const isMobile = useBreakpoint() === "sm";
 */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("lg");

  useEffect(() => {
    function calc() {
      const w = window.innerWidth;
      if (w >= breakpoints["2xl"]) setBp("2xl");
      else if (w >= breakpoints.xl) setBp("xl");
      else if (w >= breakpoints.lg) setBp("lg");
      else if (w >= breakpoints.md) setBp("md");
      else setBp("sm");
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return bp;
}

/**
 * 특정 브레이크포인트 이상인지 확인
 * @example
 * const isDesktop = useBreakpointValue("lg"); // true if >= 1024px
 */
export function useBreakpointValue(minBp: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoints[minBp]}px)`);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [minBp]);

  return matches;
}
