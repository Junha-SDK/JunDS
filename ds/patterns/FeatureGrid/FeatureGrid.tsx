"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface FeatureItem {
  /** 아이콘/이미지 */
  icon?: ReactNode;
  /** 제목 */
  title: ReactNode;
  /** 설명 */
  description: ReactNode;
  /** 링크 */
  href?: string;
  /** 강조 (highlight 카드) */
  highlighted?: boolean;
}

export type FeatureGridLayout = "card" | "minimal" | "iconLeft";

export interface FeatureGridProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 섹션 제목 */
  title?: ReactNode;
  /** 섹션 부제 */
  subtitle?: ReactNode;
  /** 기능 목록 */
  features: FeatureItem[];
  /** 컬럼 수 (반응형 자동 조정) */
  columns?: 2 | 3 | 4;
  /** 레이아웃 종류 */
  layout?: FeatureGridLayout;
}

const colMap: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * 마케팅 섹션 — 기능/혜택 그리드 (3가지 레이아웃 지원).
 * @example
 * <FeatureGrid title="왜 JunDS?" features={[{icon:"⚡", title:"빠름", description:"..."}]} />
 * @status stable
 * @since 2.3.0
 * @tags marketing
 */
export const FeatureGrid = forwardRef<HTMLElement, FeatureGridProps>(function FeatureGrid(
  { title, subtitle, features, columns = 3, layout = "card", className, ...props },
  ref,
) {
  return (
    <section
      ref={ref}
      className={cn("px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto", className)}
      {...props}
    >
      {(title || subtitle) && (
        <div className="text-center mb-10 max-w-2xl mx-auto">
          {title && <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>}
          {subtitle && <p className="mt-3 text-base text-muted">{subtitle}</p>}
        </div>
      )}
      <div className={cn("grid grid-cols-1 gap-6", colMap[columns])}>
        {features.map((f, i) => {
          const inner = (
            <>
              {f.icon && (
                <div className={cn(
                  "inline-flex items-center justify-center rounded-md text-primary",
                  layout === "iconLeft" ? "w-10 h-10 bg-primary-soft mb-0 shrink-0" : "w-12 h-12 bg-primary-soft mb-4 text-2xl",
                )}>
                  {f.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.description}</p>
              </div>
            </>
          );

          const baseClass = cn(
            layout === "card" && "rounded-xl border bg-surface p-6 transition-shadow hover:shadow-md",
            layout === "iconLeft" && "flex items-start gap-4",
            layout === "minimal" && "px-2",
            f.highlighted && layout === "card" && "border-primary ring-1 ring-primary/30",
            !f.highlighted && layout === "card" && "border-border",
          );

          if (f.href) {
            return (
              <a key={i} href={f.href} className={cn(baseClass, "block hover:no-underline")}>
                {inner}
              </a>
            );
          }
          return (
            <div key={i} className={baseClass}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
});
