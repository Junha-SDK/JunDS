"use client";
import { useState, useRef, useId, forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** 툴팁 내용 */
  content: ReactNode;
  /** 표시 위치 */
  position?: TooltipPosition;
  /** 표시 지연(ms) */
  delay?: number;
  /** 트리거 요소 */
  children: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

/**
 * 툴팁
 * @example
 * <Tooltip content="저장합니다"><Button>저장</Button></Tooltip>
 * @status stable
 * @since 2.2.0
 * @tags overlay
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, position = "top", delay = 200, children, className }, ref) => {
    const [show, setShow] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const tooltipId = useId();

    const handleEnter = () => {
      timerRef.current = setTimeout(() => setShow(true), delay);
    };
    const handleLeave = () => {
      clearTimeout(timerRef.current);
      setShow(false);
    };

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex", className)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        aria-describedby={show ? tooltipId : undefined}
      >
        {children}
        {show && (
          <div
            id={tooltipId}
            className={cn(
              // bg-gray-900 은 다크 크롬을 의도한 값이라 두 모드 모두에서 맞다 —
              // 대신 그림자 한 겹으로는 떠 보이지 않으므로 다층 그림자 + 얇은 링으로 세운다
              "absolute z-80 px-2.5 py-1.5 text-xs text-white bg-gray-900/95 rounded-lg backdrop-blur-sm",
              "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45),0_4px_10px_-4px_rgba(0,0,0,0.3)] ring-1 ring-white/12",
              "whitespace-nowrap pointer-events-none animate-fade-in motion-reduce:animate-none",
              positionStyles[position],
            )}
            role="tooltip"
          >
            {content}
          </div>
        )}
      </div>
    );
  },
);
Tooltip.displayName = "Tooltip";
