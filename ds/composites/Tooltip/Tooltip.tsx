"use client";
import { useState, useRef, useId, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  children: ReactNode;
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
 */
export function Tooltip({ content, position = "top", delay = 200, children, className }: TooltipProps) {
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
            "absolute z-80 px-2.5 py-1.5 text-xs text-white bg-gray-900/95 rounded-lg shadow-xl shadow-black/25 border border-gray-700/50 backdrop-blur-sm",
            "whitespace-nowrap pointer-events-none animate-fade-in",
            positionStyles[position],
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
