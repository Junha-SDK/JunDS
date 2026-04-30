"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

export interface AutoHideHeaderProps {
  /** 자식 요소 */
  children: React.ReactNode;
  /** 스크롤 감지 임계값 (px) */
  threshold?: number;
  /** 헤더 높이 (px) */
  height?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 자동 숨김 헤더 컴포넌트
 *
 * 스크롤 방향을 감지하여 아래로 스크롤 시 숨기고,
 * 위로 스크롤 시 다시 표시합니다.
 * 페이지 상단에서는 항상 표시됩니다.
 *
 * @example
 * ```tsx
 * <AutoHideHeader threshold={8} height={64}>
 *   <nav>...</nav>
 * </AutoHideHeader>
 * ```
 * @status stable
 * @since 2.2.0
 * @tags navigation
 */
export function AutoHideHeader({
  children,
  threshold = 8,
  height = 64,
  className,
}: AutoHideHeaderProps) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      // 페이지 상단 근처에서는 항상 표시
      if (y < height) {
        setHidden(false);
      }
      // 아래로 스크롤: 숨김
      else if (y - lastScrollY.current > threshold) {
        setHidden(true);
      }
      // 위로 스크롤: 표시
      else if (lastScrollY.current - y > threshold) {
        setHidden(false);
      }

      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, height]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-transform duration-300 ease-in-out",
        hidden && "-translate-y-full",
        className,
      )}
      style={{ height }}
    >
      {children}
    </header>
  );
}
