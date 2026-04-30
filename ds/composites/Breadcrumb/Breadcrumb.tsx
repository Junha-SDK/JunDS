"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface BreadcrumbProps {
  /** 경로 항목 목록 */
  items: BreadcrumbItem[];
  /** 항목 사이 구분자 */
  separator?: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 브레드크럼 네비게이션
 * @example
 * <Breadcrumb items={[{label:"홈",href:"/"},{label:"프로젝트",href:"/projects"},{label:"설정"}]} />
 * @status stable
 * @since 2.2.0
 * @tags navigation
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator, className }, ref) => {
  const sep = separator || (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted-light">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <nav ref={ref} aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="shrink-0">{sep}</span>}
            {item.href && !isLast ? (
              <a
                href={item.href}
                className="flex items-center gap-1 text-muted hover:text-foreground transition-colors"
              >
                {item.icon}
                {item.label}
              </a>
            ) : (
              <span className={cn("flex items-center gap-1", isLast ? "text-foreground font-medium" : "text-muted")}>
                {item.icon}
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
},
);
Breadcrumb.displayName = "Breadcrumb";
