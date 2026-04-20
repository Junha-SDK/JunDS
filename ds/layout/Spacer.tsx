"use client";
import { cn } from "../utils/cn";

type SpacerProps = {
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
  className?: string;
};

const sizeMap: Record<number, string> = {
  1: "h-1", 2: "h-2", 3: "h-3", 4: "h-4", 5: "h-5", 6: "h-6",
  8: "h-8", 10: "h-10", 12: "h-12", 16: "h-16",
};

/** 수직 간격 */
export function Spacer({ size = 4, className }: SpacerProps) {
  return <div className={cn(sizeMap[size], className)} aria-hidden />;
}
