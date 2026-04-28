"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface StickyProps {
  children: ReactNode;
  top?: number;
  zIndex?: number;
  className?: string;
}

export function Sticky({ children, top = 0, zIndex = 10, className }: StickyProps) {
  return (
    <div className={cn("sticky", className)} style={{ top, zIndex }}>
      {children}
    </div>
  );
}
