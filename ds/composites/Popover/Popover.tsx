"use client";
import { useState, useRef, forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";

export interface PopoverProps {
  /** 트리거 요소 */
  trigger: ReactNode;
  /** 팝오버 내용 */
  content: ReactNode;
  /** 가로 정렬 */
  align?: "left" | "right" | "center";
  /** 노출 방향 */
  side?: "top" | "bottom";
  /** 추가 클래스 */
  className?: string;
}

const alignStyles = {
  left: "left-0",
  right: "right-0",
  center: "left-1/2 -translate-x-1/2",
};

/**
 * 팝오버
 * @example
 * <Popover trigger={<Button>열기</Button>} content={<div>내용</div>} />
 * @status stable
 * @since 2.2.0
 * @tags overlay
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ trigger, content, align = "left", side = "bottom", className }, forwardedRef) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={(node) => {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }} className={cn("relative inline-block", className)}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-60 bg-white border border-border rounded-xl shadow-xl shadow-black/15 p-4 animate-fade-in-scale backdrop-blur-sm",
            side === "bottom" ? "mt-1 top-full" : "mb-1 bottom-full",
            alignStyles[align],
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
},
);
Popover.displayName = "Popover";
