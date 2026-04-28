"use client";
import { useEffect, useState, useCallback } from "react";

export interface ScrollPosition {
  x: number;
  y: number;
}

export function useWindowScroll() {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setPosition({ x: window.scrollX, y: window.scrollY });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = useCallback((opts: ScrollToOptions) => {
    window.scrollTo({ behavior: "smooth", ...opts });
  }, []);

  return { ...position, scrollTo };
}
