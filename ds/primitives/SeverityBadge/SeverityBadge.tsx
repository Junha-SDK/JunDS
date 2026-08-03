"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export type Severity = "ok" | "warn" | "danger" | "info" | "neutral";

export interface SeverityBadgeProps {
  /** 심각도 수준 */
  severity: Severity;
  /** 뱃지 내용 */
  children: ReactNode;
  /** 작은 점만 표시 */
  dot?: boolean;
  /** 크기 */
  size?: "sm" | "md";
  /** 추가 클래스 */
  className?: string;
}

// Tailwind 팔레트 직접 사용은 다크에서 배경만 어두워지고 글자는 그대로 남아 대비가 깨진다.
// 모드를 따라가는 의미 토큰으로 옮긴다 — 심각도는 이미 디자인 시스템의 어휘다.
const severityStyles: Record<Severity, string> = {
  ok: "bg-success-light text-success",
  warn: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  info: "bg-info-light text-info",
  neutral: "bg-muted/12 text-muted",
};

const dotColors: Record<Severity, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-muted",
};

const sizeStyles: Record<"sm" | "md", string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

/**
 * 심각도 뱃지
 * @description ok/warn/danger/info/neutral 심각도 수준을 시각적으로 표현하는 뱃지 컴포넌트
 * @example
 * <SeverityBadge severity="ok">정상</SeverityBadge>
 * <SeverityBadge severity="danger" dot>오류</SeverityBadge>
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function SeverityBadge({
  severity,
  children,
  dot,
  size = "md",
  className,
}: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        // 배지는 색만 바뀐다 — `all` 은 패딩·글자 크기 변형까지 전이 대상으로 삼는다.
        "transition-colors duration-150",
        severityStyles[severity],
        sizeStyles[size],
        className,
      )}
    >
      {dot && <span className={cn("w-2 h-2 rounded-full shrink-0", dotColors[severity])} />}
      {children}
    </span>
  );
}
