"use client";
import { useState, useRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  align?: "left" | "right" | "center";
  side?: "top" | "bottom";
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
 */
export function Popover({ trigger, content, align = "left", side = "bottom", className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
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
}
