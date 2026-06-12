"use client";
import { useEffect, useLayoutEffect } from "react";

/**
 * SSR-safe layout effect (서버에서는 useEffect, 브라우저에서는 useLayoutEffect).
 * 화면 측정/스타일 동기화 같은 hydration 직전 작업에 사용.
 * @example
 * useIsomorphicLayoutEffect(() => measure(), []);
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
