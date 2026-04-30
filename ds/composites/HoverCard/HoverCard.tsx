"use client";
import { useState, useRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface HoverCardProps {
  /** 트리거 요소 */
  trigger: ReactNode;
  /** 호버 시 표시할 콘텐츠 */
  children: ReactNode;
  /** 표시 방향 */
  side?: "top" | "bottom" | "left" | "right";
  /** 열림 지연(ms) */
  openDelay?: number;
  /** 닫힘 지연(ms) */
  closeDelay?: number;
  /** 추가 클래스 */
  className?: string;
}

const sideStyles: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

/**
 * 호버 카드
 * @example
 * <HoverCard trigger={<span>@사용자</span>} side="bottom">
 *   <div>사용자 프로필 미리보기</div>
 * </HoverCard>
 * @status stable
 * @since 2.2.0
 * @tags overlay
 */
export function HoverCard({
  trigger,
  children,
  side = "bottom",
  openDelay = 300,
  closeDelay = 200,
  className,
}: HoverCardProps) {
  const [show, setShow] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleEnter = () => {
    clearTimeout(closeTimerRef.current);
    openTimerRef.current = setTimeout(() => setShow(true), openDelay);
  };

  const handleLeave = () => {
    clearTimeout(openTimerRef.current);
    closeTimerRef.current = setTimeout(() => setShow(false), closeDelay);
  };

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {trigger}
      {show && (
        <div
          className={cn(
            "absolute z-50 w-64 p-4 bg-card rounded-xl shadow-lg border border-border",
            "animate-fade-in",
            sideStyles[side],
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
