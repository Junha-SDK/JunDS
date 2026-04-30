"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface PageHeaderBreadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps extends HTMLAttributes<HTMLElement> {
  /** 메인 제목 */
  title: ReactNode;
  /** 부제 / 설명 */
  description?: ReactNode;
  /** 브레드크럼 */
  breadcrumb?: PageHeaderBreadcrumb[];
  /** 좌측 뒤로가기 핸들러 */
  onBack?: () => void;
  /** 우측 액션 영역 */
  actions?: ReactNode;
  /** 좌측 아바타/아이콘 영역 */
  avatar?: ReactNode;
  /** 하단 탭/메타 영역 */
  footer?: ReactNode;
  /** 구분선 표시 */
  divider?: boolean;
}

/**
 * 표준 페이지 헤더: breadcrumb + title + actions + footer.
 * @example
 * <PageHeader title="사용자" breadcrumb={[{label:"홈",href:"/"},{label:"사용자"}]} actions={<Button>추가</Button>} />
 * @status stable
 * @since 2.3.0
 * @tags layout
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { title, description, breadcrumb, onBack, actions, avatar, footer, divider = true, className, ...props },
  ref,
) {
  return (
    <header
      ref={ref}
      className={cn(
        "flex flex-col gap-3 px-4 sm:px-6 py-4",
        divider && "border-b border-border",
        className,
      )}
      {...props}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-muted">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {b.href ? (
                <a href={b.href} className="hover:text-foreground transition-colors">{b.label}</a>
              ) : (
                <span className="text-foreground">{b.label}</span>
              )}
              {i < breadcrumb.length - 1 && <span className="opacity-50">/</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start gap-3 sm:gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로 가기"
            className="mt-1 flex items-center justify-center w-8 h-8 rounded-md hover:bg-surface-soft text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {avatar && <div className="shrink-0">{avatar}</div>}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold leading-tight truncate">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted line-clamp-2">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
      {footer && <div className="pt-1">{footer}</div>}
    </header>
  );
});
