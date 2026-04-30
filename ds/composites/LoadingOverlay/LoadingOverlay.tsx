"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface LoadingOverlayProps {
  /** 로딩 활성 여부 */
  active: boolean;
  /** 자식 요소 */
  children: ReactNode;
  /** 로딩 라벨 텍스트 */
  label?: string;
  /** 배경 블러 효과 적용 여부 */
  blur?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 로딩 중 자식 영역 위에 덮이는 오버레이.
 * @example
 * <LoadingOverlay active={loading} label="불러오는 중...">
 *   <Content />
 * </LoadingOverlay>
 * @status stable
 * @since 2.2.0
 * @tags feedback, overlay
 */
export function LoadingOverlay({ active, children, label = "로딩 중...", blur, className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {active && (
        <div className={cn("absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70", blur && "backdrop-blur-sm")} role="status" aria-label={label}>
          <svg className="animate-spin w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {label && <p className="text-sm text-muted mt-2">{label}</p>}
        </div>
      )}
    </div>
  );
}
