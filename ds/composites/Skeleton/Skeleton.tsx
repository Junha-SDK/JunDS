"use client";
import { cn } from "../../utils/cn";

export interface SkeletonProps {
  variant?: "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

/**
 * 스켈레톤 로딩
 * @example
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="circle" width={40} height={40} />
 * <Skeleton variant="rect" width="100%" height={200} />
 */
export function Skeleton({ variant = "text", width, height, lines = 1, className }: SkeletonProps) {
  const baseClass = "bg-gray-200 animate-pulse rounded";

  if (variant === "circle") {
    return (
      <div
        className={cn(baseClass, "rounded-full", className)}
        style={{ width: width || 40, height: height || 40 }}
      />
    );
  }

  if (variant === "rect") {
    return (
      <div
        className={cn(baseClass, "rounded-lg", className)}
        style={{ width: width || "100%", height: height || 100 }}
      />
    );
  }

  // text
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(baseClass, "h-3.5")}
          style={{
            width: i === lines - 1 && lines > 1 ? "75%" : width || "100%",
          }}
        />
      ))}
    </div>
  );
}
