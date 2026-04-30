"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface GradientBorderProps {
  /** 감싸질 콘텐츠 */
  children: ReactNode;
  /** 그라디언트 색상 배열 */
  gradient?: string;
  /** 테두리 두께(px) */
  borderWidth?: number;
  /** 모서리 둥글기 */
  rounded?: string;
  /** 애니메이션 여부 */
  animated?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 그라디언트 테두리 효과를 가진 래퍼.
 * @example
 * <GradientBorder gradient="purple-pink" rounded animated>
 *   <Card>...</Card>
 * </GradientBorder>
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export function GradientBorder({
  children,
  gradient = "from-primary via-accent to-primary",
  borderWidth = 2,
  rounded = "rounded-xl",
  animated = false,
  className,
}: GradientBorderProps) {
  return (
    <div
      className={cn(
        "relative p-[var(--bw)]",
        rounded,
        className,
      )}
      style={{ "--bw": `${borderWidth}px` } as React.CSSProperties}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          gradient,
          rounded,
          animated && "animate-[gradient-shift_3s_ease_infinite]",
        )}
        style={animated ? { backgroundSize: "200% 200%" } : undefined}
        aria-hidden="true"
      />
      <div className={cn("relative bg-white", rounded)}>
        {children}
      </div>
      {animated && (
        <style>{`
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      )}
    </div>
  );
}
