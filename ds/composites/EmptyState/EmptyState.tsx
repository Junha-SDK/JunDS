"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  /** 표시할 아이콘 */
  icon?: ReactNode;
  /** 제목 텍스트 */
  title: string;
  /** 설명 텍스트 */
  description?: string;
  /** 하단 액션 버튼 */
  action?: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 빈 상태 표시
 * @example
 * <EmptyState title="업무가 없습니다" description="새 업무를 추가해보세요" action={<Button>추가</Button>} />
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
      {icon ? (
        <div className="mb-3 text-muted-light">{icon}</div>
      ) : (
        <div className="mb-3 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-light">
            <path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
},
);
EmptyState.displayName = "EmptyState";
