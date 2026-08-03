"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Slot, Slottable } from "../../utils/Slot";
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
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
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
  { title, subtitle, features, columns = 3, layout = "card", asChild, className, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "section";
  return (
    <Comp
      ref={ref as never}
      className={cn("px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto", className)}
      {...props}
    >
      {asChild ? <Slottable>{children}</Slottable> : null}
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
                // `primary-soft` 는 토큰에 없는 이름이라 배경이 아예 칠해지지 않았다.
                // 실제로 존재하는 `primary-light` 로 바로잡는다.
                <div
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl bg-primary-light text-primary-ink",
                    layout === "iconLeft" ? "w-10 h-10 mb-0 shrink-0" : "w-12 h-12 mb-4 text-2xl",
                  )}
                >
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
            layout === "card" && [
              "rounded-xl border bg-surface p-6 transition-shadow",
              // 카드는 면이다 — 얇은 기본 그림자 + 상단 인셋 하이라이트로 두께를 주고,
              // 호버에서만 다층 그림자로 한 단 들어올린다.
              "shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.1)]",
              "hover:shadow-[0_12px_30px_-14px_rgba(0,0,0,0.26),0_4px_10px_-6px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]",
            ],
            layout === "iconLeft" && "flex items-start gap-4",
            layout === "minimal" && "px-2",
            f.highlighted && layout === "card" && "border-primary ring-1 ring-primary/30",
            !f.highlighted && layout === "card" && "border-border",
          );

          if (f.href) {
            return (
              <a
                key={i}
                href={f.href}
                className={cn(
                  baseClass,
                  "block hover:no-underline rounded-xl",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
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
    </Comp>
  );
});
