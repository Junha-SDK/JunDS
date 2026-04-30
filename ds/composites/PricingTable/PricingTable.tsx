"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface PricingPlan {
  /** 플랜 ID */
  id: string;
  /** 플랜 이름 */
  name: string;
  /** 가격 (예: "$9", "₩9,900") */
  price: ReactNode;
  /** 가격 단위 (예: "/월") */
  priceSuffix?: string;
  /** 짧은 설명 */
  description?: string;
  /** 기능 리스트 */
  features: ReactNode[];
  /** CTA 라벨 */
  ctaLabel?: string;
  /** CTA 클릭 핸들러 */
  onCta?: () => void;
  /** 강조(추천) */
  highlighted?: boolean;
  /** 배지 텍스트 (예: "인기") */
  badge?: string;
  /** 비활성화 */
  disabled?: boolean;
}

export interface PricingTableProps extends HTMLAttributes<HTMLDivElement> {
  /** 플랜 목록 */
  plans: PricingPlan[];
  /** 컬럼 수 (기본 자동) */
  columns?: number;
}

/**
 * 요금제 카드 그리드. SaaS / 마케팅 페이지용.
 * @example
 * <PricingTable plans={[{ id:"free", name:"Free", price:"$0", features:["1 user"]}, ...]} />
 * @status stable
 * @since 2.3.0
 * @tags marketing
 */
export const PricingTable = forwardRef<HTMLDivElement, PricingTableProps>(function PricingTable(
  { plans, columns, className, ...props },
  ref,
) {
  const cols = columns ?? Math.min(plans.length, 4);

  return (
    <div
      ref={ref}
      className={cn("grid gap-4", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      {...props}
    >
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "relative flex flex-col rounded-xl border bg-surface p-6 transition-shadow",
            plan.highlighted
              ? "border-primary shadow-lg ring-1 ring-primary/30"
              : "border-border hover:shadow-md",
            plan.disabled && "opacity-60",
          )}
        >
          {plan.badge && (
            <span className="absolute -top-2 right-4 rounded-full bg-primary text-white text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">
              {plan.badge}
            </span>
          )}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            {plan.description && <p className="mt-1 text-sm text-muted">{plan.description}</p>}
          </div>
          <div className="mb-5 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
            {plan.priceSuffix && <span className="text-sm text-muted">{plan.priceSuffix}</span>}
          </div>
          <ul className="flex-1 space-y-2 mb-6">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-success">
                  <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {plan.ctaLabel && (
            <button
              type="button"
              onClick={plan.onCta}
              disabled={plan.disabled}
              className={cn(
                "w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                plan.highlighted
                  ? "bg-primary text-white hover:bg-primary-hover"
                  : "border border-border hover:bg-surface-soft",
              )}
            >
              {plan.ctaLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
});
