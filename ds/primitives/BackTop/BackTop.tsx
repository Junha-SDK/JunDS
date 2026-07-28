"use client";
import { useState, useEffect, useCallback, forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface BackTopProps {
  /** 버튼이 나타나기 시작하는 스크롤 임계값(px) */
  threshold?: number;
  /** 추가 클래스 */
  className?: string;
  /** 버튼 내부 커스텀 콘텐츠 */
  children?: ReactNode;
}

/**
 * 상단으로 이동 버튼
 * @description 페이지를 스크롤하면 나타나는 상단 이동 버튼입니다.
 * @example
 * <BackTop threshold={300} />
 * @status stable
 * @since 2.2.0
 * @tags navigation
 */
export const BackTop = forwardRef<HTMLButtonElement, BackTopProps>(function BackTop(
  { threshold = 400, className, children },
  ref,
) {
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
      ref={ref}
      type="button"
      onClick={scrollToTop}
      aria-label="상단으로 이동"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center",
        "w-10 h-10 rounded-full bg-card border border-border text-muted",
        // 떠 있는 버튼이라 한 겹 그림자로는 배경에서 떨어져 보이지 않는다 — 넓은 확산 +
        // 좁은 접지 그림자에 얇은 링을 더해 면을 세운다.
        "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-border/60",
        "hover:text-primary-ink hover:border-primary/30",
        "hover:shadow-[0_14px_36px_-10px_rgba(0,0,0,0.4),0_6px_14px_-6px_rgba(0,0,0,0.24)]",
        "active:scale-95",
        // transform 이 섞이므로 감속 요청을 받는다. all 을 쓰면 크기·여백까지 전이 대상이 된다.
        "transition-[color,border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
});

BackTop.displayName = "BackTop";
