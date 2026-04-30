"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface StickyProps {
  /** 고정될 콘텐츠 */
  children: ReactNode;
  /** 상단 오프셋(px) */
  top?: number;
  /** z-index 값 */
  zIndex?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 스크롤 시 지정 위치에 달라붙는 sticky 래퍼.
 * @example
 * <Sticky top={64} zIndex={10}>
 *   <Toolbar />
 * </Sticky>
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export function Sticky({ children, top = 0, zIndex = 10, className }: StickyProps) {
  return (
    <div className={cn("sticky", className)} style={{ top, zIndex }}>
      {children}
    </div>
  );
}
