"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface TrustItem {
  key: string;
  label: string;
  description?: string;
  status: "pass" | "fail" | "warning" | "pending";
  icon?: ReactNode;
}

export interface TrustIndicatorProps {
  items: TrustItem[];
  /** 제목 */
  title?: string;
  className?: string;
}

const statusConfig = {
  pass: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
        <path d="M5 8.2l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "통과",
    textColor: "text-green-700",
  },
  fail: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#fef2f2" stroke="#dc2626" strokeWidth="1" />
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: "실패",
    textColor: "text-red-700",
  },
  warning: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
        <path d="M8 5v3.5M8 11h.01" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: "주의",
    textColor: "text-amber-700",
  },
  pending: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" />
        <path d="M8 5v3l2 1" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "대기",
    textColor: "text-gray-500",
  },
};

/**
 * 보안 신뢰 지표 — 보안 항목별 통과/실패 상태 표시
 * @example
 * <TrustIndicator title="보안 점검" items={[
 *   { key:"ssl", label:"SSL 인증서", status:"pass" },
 *   { key:"2fa", label:"2단계 인증", status:"fail", description:"설정이 필요합니다" },
 * ]} />
 */
export function TrustIndicator({ items, title, className }: TrustIndicatorProps) {
  const passCount = items.filter((i) => i.status === "pass").length;
  const score = Math.round((passCount / items.length) * 100);
  const scoreColor = score >= 80 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className={cn("bg-white border border-border rounded-xl overflow-hidden", className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light bg-gray-50/50">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <div className="flex items-center gap-2">
            <span className={cn("text-lg font-bold tabular-nums", scoreColor)}>{score}%</span>
            <span className="text-[10px] text-muted">({passCount}/{items.length})</span>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="divide-y divide-border-light">
        {items.map((item) => {
          const cfg = statusConfig[item.status];
          return (
            <div key={item.key} className="flex items-center gap-3 px-4 py-2.5">
              <span className="shrink-0">{item.icon || cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                {item.description && <div className="text-xs text-muted">{item.description}</div>}
              </div>
              <span className={cn("text-[10px] font-semibold uppercase", cfg.textColor)}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
