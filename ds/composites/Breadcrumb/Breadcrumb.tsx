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
        <path
          d="M5 3l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        // 구분자와 라벨이 줄바꿈으로 갈라지지 않게 각 단계를 한 덩어리로 유지한다.
        // (가로 스크롤은 걸지 않는다 — 스크롤 컨테이너가 포커스 링의 offset 을 잘라먹는다)
        className={cn("flex items-center gap-1.5 text-sm flex-wrap", className)}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
              {i > 0 && <span className="shrink-0">{sep}</span>}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  // 링크는 실제로 포커스를 받는다 — 링이 없으면 키보드로 어느 단계에 있는지 알 수 없다
                  className="flex items-center gap-1 text-muted hover:text-foreground transition-colors duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.icon}
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1",
                    isLast ? "text-foreground font-medium" : "text-muted",
                  )}
                >
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
