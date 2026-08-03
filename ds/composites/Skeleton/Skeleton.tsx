"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface SkeletonProps {
  /** 스켈레톤 모양 */
  variant?: "text" | "circle" | "rect";
  /** 너비 */
  width?: string | number;
  /** 높이 */
  height?: string | number;
  /** 텍스트 변형의 줄 수 */
  lines?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 스켈레톤 로딩
 * @example
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="circle" width={40} height={40} />
 * <Skeleton variant="rect" width="100%" height={200} />
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "text", width, height, lines = 1, className }, ref) => {
    // bg-gray-200 은 다크에서 밝은 회색 덩어리로 남는다. muted 알파는 두 모드 다 성립한다.
    // 맥동은 움직임이므로 감속 요청을 받는다 — 라이브러리 소비자는 globals.css 를 함께 쓰지 않는다.
    const baseClass = "bg-muted/15 rounded-md animate-pulse motion-reduce:animate-none";

    if (variant === "circle") {
      return (
        <div
          ref={ref}
          className={cn(baseClass, "rounded-full", className)}
          style={{ width: width || 40, height: height || 40 }}
        />
      );
    }

    if (variant === "rect") {
      return (
        <div
          ref={ref}
          className={cn(baseClass, "rounded-xl", className)}
          style={{ width: width || "100%", height: height || 100 }}
        />
      );
    }

    // text
    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)}>
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
  },
);
Skeleton.displayName = "Skeleton";
