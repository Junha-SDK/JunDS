"use client";
import { cn } from "../../utils/cn";

export type SecurityLevel = "critical" | "warning" | "safe" | "verified" | "unverified";

export interface SecurityBadgeProps {
  /** 보안 레벨 */
  level: SecurityLevel;
  /** 사용자 정의 라벨 */
  label?: string;
  /** 아이콘 표시 */
  showIcon?: boolean;
  /** 뱃지 크기 */
  size?: "sm" | "md" | "lg";
  /** 추가 클래스 */
  className?: string;
}

const config: Record<SecurityLevel, { icon: string; defaultLabel: string; bg: string; text: string; border: string }> = {
  critical: {
    icon: "M10 2L1.5 17h17L10 2zM10 7v4M10 13.5h.01",
    defaultLabel: "위험",
    bg: "bg-red-50", text: "text-red-700", border: "border-red-200",
  },
  warning: {
    icon: "M10 2L1.5 17h17L10 2zM10 7v4M10 13.5h.01",
    defaultLabel: "주의",
    bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200",
  },
  safe: {
    icon: "M9 12l2 2 4-4M5.8 4.5A7.5 7.5 0 0110 3a7.5 7.5 0 014.2 1.5c.2 1.4.3 2.5.3 3.5 0 4.5-2 7.5-4.5 9-2.5-1.5-4.5-4.5-4.5-9 0-1 .1-2.1.3-3.5z",
    defaultLabel: "안전",
    bg: "bg-green-50", text: "text-green-700", border: "border-green-200",
  },
  verified: {
    icon: "M5 10l3.5 3.5L15 7",
    defaultLabel: "인증됨",
    bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200",
  },
  unverified: {
    icon: "M10 5v5M10 13h.01",
    defaultLabel: "미인증",
    bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200",
  },
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-[10px] gap-1",
  md: "px-2 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

/**
 * 보안 레벨 뱃지
 * @example
 * <SecurityBadge level="safe" />
 * <SecurityBadge level="critical" label="비밀번호 취약" />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function SecurityBadge({ level, label, showIcon = true, size = "md", className }: SecurityBadgeProps) {
  const c = config[level];
  const iconSize = size === "sm" ? 10 : size === "md" ? 12 : 14;

  return (
    <span className={cn(
      "inline-flex items-center font-semibold rounded-full border",
      c.bg, c.text, c.border,
      sizeStyles[size],
      className,
    )}>
      {showIcon && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none" className="shrink-0">
          <path d={c.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label || c.defaultLabel}
    </span>
  );
}
