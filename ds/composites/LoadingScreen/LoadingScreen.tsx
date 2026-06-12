"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type LoadingScreenVariant = "spinner" | "bars" | "pulse" | "logo";

export interface LoadingScreenProps extends HTMLAttributes<HTMLDivElement> {
  /** 표시 종류 */
  variant?: LoadingScreenVariant;
  /** 메시지 */
  message?: ReactNode;
  /** 진행률 (0-100, undefined면 indeterminate) */
  progress?: number;
  /** 풀스크린 (기본 true) */
  fullscreen?: boolean;
  /** 배경 투명 */
  transparent?: boolean;
  /** 로고/커스텀 컨텐츠 (variant=logo) */
  logo?: ReactNode;
}

/**
 * 풀페이지 또는 컨테이너 로딩 화면 (앱 부팅, 라우트 전환 등).
 * @example
 * <LoadingScreen message="데이터를 불러오는 중..." progress={42} />
 * @status stable
 * @since 2.3.0
 * @tags feedback
 */
export const LoadingScreen = forwardRef<HTMLDivElement, LoadingScreenProps>(function LoadingScreen(
  { variant = "spinner", message, progress, fullscreen = true, transparent = false, logo, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={typeof message === "string" ? message : "로딩 중"}
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullscreen ? "fixed inset-0 z-50 min-h-screen" : "min-h-[200px]",
        !transparent && "bg-background/80 backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      {variant === "spinner" && (
        <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary" />
        </svg>
      )}
      {variant === "bars" && (
        <div className="flex items-end gap-1 h-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-1.5 bg-primary rounded-full"
              style={{ animation: `junds-bars 1s ease-in-out ${i * 0.1}s infinite`, height: "100%" }}
            />
          ))}
          <style>{`@keyframes junds-bars { 0%,100% { transform: scaleY(0.4) } 50% { transform: scaleY(1) } }`}</style>
        </div>
      )}
      {variant === "pulse" && (
        <div className="relative w-12 h-12">
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-primary" />
        </div>
      )}
      {variant === "logo" && logo}
      {message && <div className="text-sm text-muted">{message}</div>}
      {progress !== undefined && (
        <div className="w-48 h-1 rounded-full bg-surface-soft overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
});
