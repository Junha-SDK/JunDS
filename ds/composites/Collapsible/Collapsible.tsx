"use client";
import { useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * 접기/펼치기 컴포넌트 (단일 항목)
 * @example
 * <Collapsible trigger={<span>더보기</span>}>
 *   <p>숨겨진 내용</p>
 * </Collapsible>
 */
export function Collapsible({
  open: controlledOpen,
  onOpenChange,
  trigger,
  children,
  defaultOpen = false,
  className,
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const toggle = useCallback(() => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }, [isOpen, isControlled, onOpenChange]);

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onClick={toggle}
        className="w-full cursor-pointer"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
