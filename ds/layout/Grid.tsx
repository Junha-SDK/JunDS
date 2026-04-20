"use client";
import { cn } from "../utils/cn";
import type { ReactNode, HTMLAttributes } from "react";

type GridProps = HTMLAttributes<HTMLDivElement> & {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  children: ReactNode;
};

const colsMap: Record<number, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
  5: "grid-cols-5", 6: "grid-cols-6", 12: "grid-cols-12",
};
const gapMap: Record<number, string> = {
  0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4",
  5: "gap-5", 6: "gap-6", 8: "gap-8",
};

export function Grid({ cols = 1, gap = 4, className, children, ...props }: GridProps) {
  return (
    <div className={cn("grid", colsMap[cols], gapMap[gap], className)} {...props}>
      {children}
    </div>
  );
}
