"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface NotificationProps {
  /** 알림 제목 */
  title: string;
  /** 보조 설명 */
  description?: string;
  /** 알림 유형 */
  variant?: "info" | "success" | "warning" | "danger";
  /** 좌측 아이콘 */
  icon?: ReactNode;
  /** 하단 액션 영역 */
  action?: ReactNode;
  /** 닫기 콜백 */
  onClose?: () => void;
  /** 추가 클래스 */
  className?: string;
}

const variantStyles = {
  info: "border-info/30 bg-info/5",
  success: "border-success/30 bg-success/5",
  warning: "border-warning/30 bg-warning/5",
  danger: "border-danger/30 bg-danger/5",
};

const iconColors = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

/**
 * 상단에 잠깐 떠오르는 알림 카드.
 * @example
 * <Notification title="저장 완료" description="변경사항이 저장되었습니다." variant="success" />
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export function Notification({
  title,
  description,
  variant = "info",
  icon,
  action,
  onClose,
  className,
}: NotificationProps) {
  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl border",
        // 면이 있는 카드 — 얕은 그림자 + 상단 인셋 하이라이트로 배경에서 한 겹 띄운다
        "shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.10)]",
        variantStyles[variant],
        className,
      )}
      role="alert"
    >
      {icon && <div className={cn("shrink-0 mt-0.5", iconColors[variant])}>{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "shrink-0 self-start p-1 rounded-lg text-muted cursor-pointer",
            "transition-colors duration-150 hover:text-foreground hover:bg-muted/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          aria-label="닫기"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3.5 3.5l7 7M10.5 3.5l-7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
