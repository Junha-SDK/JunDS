"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface SwipeActionProps {
  /** 자식 콘텐츠 */
  children: ReactNode;
  /** 왼쪽 스와이프 시 노출할 액션 목록 */
  leftActions?: { label: string; color: string; onClick: () => void }[];
  /** 오른쪽 스와이프 시 노출할 액션 목록 */
  rightActions?: { label: string; color: string; onClick: () => void }[];
  /** 스와이프 임계 거리(px) */
  threshold?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 좌/우로 스와이프 시 액션이 노출되는 행 래퍼.
 * @example
 * <SwipeAction
 *   leftActions={[{ label: "보관", onClick: archive }]}
 *   rightActions={[{ label: "삭제", onClick: remove, variant: "danger" }]}
 * >
 *   <ListItem />
 * </SwipeAction>
 * @status stable
 * @since 2.2.0
 * @tags form, control
 */
export function SwipeAction({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
}: SwipeActionProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragging.current) return;
      const delta = e.touches[0].clientX - startX.current;
      const maxLeft = leftActions.length > 0 ? threshold : 0;
      const maxRight = rightActions.length > 0 ? -threshold : 0;
      setOffset(Math.max(maxRight, Math.min(maxLeft, delta)));
    },
    [leftActions.length, rightActions.length, threshold],
  );

  const handleTouchEnd = () => {
    dragging.current = false;
    if (Math.abs(offset) < threshold / 2) setOffset(0);
    else setOffset(offset > 0 ? threshold : -threshold);
  };

  const reset = () => setOffset(0);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className="absolute inset-y-0 left-0 flex items-stretch">
          {leftActions.map((action, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                action.onClick();
                reset();
              }}
              // 배경이 소비자가 넘긴 색이라 배경 오프셋 링은 통하지 않는다 — 안쪽 흰 링으로.
              className="flex items-center px-4 text-white text-xs font-medium cursor-pointer transition-[filter] duration-150 hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/85 motion-reduce:transition-none"
              style={{ backgroundColor: action.color, width: threshold / leftActions.length }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex items-stretch">
          {rightActions.map((action, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                action.onClick();
                reset();
              }}
              // 배경이 소비자가 넘긴 색이라 배경 오프셋 링은 통하지 않는다 — 안쪽 흰 링으로.
              className="flex items-center px-4 text-white text-xs font-medium cursor-pointer transition-[filter] duration-150 hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/85 motion-reduce:transition-none"
              style={{ backgroundColor: action.color, width: threshold / rightActions.length }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      {/* Content */}
      <div
        // bg-white 는 다크에서 라이트 면으로 남는다. 밑에 깔린 액션이 비치면 안 되므로
        // 불투명한 카드 토큰이어야 한다.
        className="relative bg-card transition-transform motion-reduce:transition-none"
        style={{
          transform: `translateX(${offset}px)`,
          transitionDuration: dragging.current ? "0ms" : "300ms",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
