"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * 요소 hover 상태 추적 (CSS :hover로 안 되는 React 분기에 사용).
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const isHover = useHover(ref);
 * return <div ref={ref}>{isHover ? "hover" : "idle"}</div>;
 */
export function useHover<T extends HTMLElement>(ref: RefObject<T | null>): boolean {
  const [hovered, setHovered] = useState(false);
  const enterRef = useRef(() => setHovered(true));
  const leaveRef = useRef(() => setHovered(false));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const enter = enterRef.current;
    const leave = leaveRef.current;
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, [ref]);

  return hovered;
}
