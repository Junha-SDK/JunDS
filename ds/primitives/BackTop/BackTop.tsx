"use client";
import { useState, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface BackTopProps {
  threshold?: number;
  className?: string;
  children?: ReactNode;
}

/**
 * 상단으로 이동 버튼
 * @description 페이지를 스크롤하면 나타나는 상단 이동 버튼입니다.
 * @example
 * <BackTop threshold={300} />
 */
export function BackTop({ threshold = 400, className, children }: BackTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="상단으로 이동"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center",
        "w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200",
        "text-gray-600 hover:text-primary hover:border-primary/30",
        "transition-all duration-200 hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className,
      )}
    >
      {children ?? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 16V4M10 4l-5 5M10 4l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
