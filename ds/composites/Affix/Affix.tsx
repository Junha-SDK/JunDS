"use client";
import { cn } from "../../utils/cn";
import type { ReactNode, CSSProperties } from "react";

export interface AffixProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 화면 고정 좌표 */
  position?: { top?: number; bottom?: number; left?: number; right?: number };
  /** z-index 값 */
  zIndex?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 스크롤 시 지정 위치에 고정되는 컨테이너.
 * @example
 * <Affix position="top" zIndex={50}>
 *   <Toolbar />
 * </Affix>
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export function Affix({ children, position = { bottom: 20, right: 20 }, zIndex = 40, className }: AffixProps) {
  const style: CSSProperties = { position: "fixed", zIndex, ...position };
  return (
    <div className={cn(className)} style={style}>
      {children}
    </div>
  );
}
