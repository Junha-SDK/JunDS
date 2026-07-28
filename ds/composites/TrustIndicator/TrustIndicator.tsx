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
  /** 신뢰 지표 항목 */
  items: TrustItem[];
  /** 제목 */
  title?: string;
  /** 추가 클래스 */
  className?: string;
}

// 아이콘의 12개 리터럴 색은 상태를 뜻하는 것이지 브랜드가 아니다 — 라이트 값이 그대로 박혀
// 있어 다크에서 배지가 그대로 튄다. 같은 뜻의 의미 토큰(연한 면 + 진한 선)으로 옮긴다.
const statusConfig = {
  pass: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="var(--success-light)"
          stroke="var(--success)"
          strokeWidth="1"
        />
        <path
          d="M5 8.2l2 2 4-4"
          stroke="var(--success)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: "통과",
    textColor: "text-success",
  },
  fail: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="var(--danger-light)"
          stroke="var(--danger)"
          strokeWidth="1"
        />
        <path
          d="M5.5 5.5l5 5M10.5 5.5l-5 5"
          stroke="var(--danger)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    label: "실패",
    textColor: "text-danger",
  },
  warning: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="var(--warning-light)"
          stroke="var(--warning)"
          strokeWidth="1"
        />
        <path
          d="M8 5v3.5M8 11h.01"
          stroke="var(--warning)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    label: "주의",
    textColor: "text-warning",
  },
  pending: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="var(--border-light)"
          stroke="var(--muted-light)"
          strokeWidth="1"
        />
        <path
          d="M8 5v3l2 1"
          stroke="var(--muted-light)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: "대기",
    textColor: "text-muted",
  },
};

/**
 * 보안 신뢰 지표 — 보안 항목별 통과/실패 상태 표시
 * @example
 * <TrustIndicator title="보안 점검" items={[
 *   { key:"ssl", label:"SSL 인증서", status:"pass" },
 *   { key:"2fa", label:"2단계 인증", status:"fail", description:"설정이 필요합니다" },
 * ]} />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function TrustIndicator({ items, title, className }: TrustIndicatorProps) {
  const passCount = items.filter((i) => i.status === "pass").length;
  const score = Math.round((passCount / items.length) * 100);
  const scoreColor = score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-danger";

  return (
    <div
      className={cn(
        // 카드는 면이다 — 얕은 그림자 한 겹으로 배경에서 살짝 들어올린다
        "bg-card border border-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light bg-surface-soft">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <div className="flex items-center gap-2">
            {/* 숫자+단위는 좁은 칸에서 갈라지면 안 된다 */}
            <span className={cn("text-lg font-bold tabular-nums whitespace-nowrap", scoreColor)}>
              {score}%
            </span>
            <span className="text-[10px] text-muted tabular-nums whitespace-nowrap">
              ({passCount}/{items.length})
            </span>
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
                <div className="text-sm font-medium text-foreground truncate">{item.label}</div>
                {item.description && <div className="text-xs text-muted">{item.description}</div>}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase whitespace-nowrap shrink-0",
                  cfg.textColor,
                )}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
