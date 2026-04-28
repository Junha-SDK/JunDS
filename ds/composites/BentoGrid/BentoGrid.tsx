"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface BentoGridProps {
  children: ReactNode;
  cols?: number;
  gap?: number;
  className?: string;
}

export interface BentoGridItemProps {
  children: ReactNode;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2 | 3;
  className?: string;
}

const colSpanMap = { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3" };
const rowSpanMap = { 1: "row-span-1", 2: "row-span-2", 3: "row-span-3" };

export function BentoGrid({ children, cols = 4, gap = 4, className }: BentoGridProps) {
  const colsClass: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };
  return (
    <div className={cn("grid auto-rows-[180px]", colsClass[cols] ?? "grid-cols-4", className)} style={{ gap: `${gap * 4}px` }}>
      {children}
    </div>
  );
}

function BentoGridItem({ children, colSpan = 1, rowSpan = 1, className }: BentoGridItemProps) {
  return (
    <div className={cn(
      "rounded-2xl border border-border bg-white p-5 overflow-hidden",
      "transition-shadow duration-300 hover:shadow-lg",
      colSpanMap[colSpan],
      rowSpanMap[rowSpan],
      className,
    )}>
      {children}
    </div>
  );
}

BentoGrid.Item = BentoGridItem;
