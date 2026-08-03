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
            "relative flex flex-col rounded-2xl border bg-surface p-6 min-w-0 transition-shadow duration-200",
            plan.highlighted
              // 추천 플랜은 한 겹 shadow-lg 로는 옆 카드와 같은 평면에 머문다 — 두 겹으로 들어올린다.
              ? "border-primary ring-1 ring-primary/30 shadow-[0_18px_40px_-14px_var(--primary-glow),0_6px_14px_-6px_rgba(0,0,0,0.18)]"
              : "border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-md",
            plan.disabled && "opacity-60",
          )}
        >
          {plan.badge && (
            <span className="absolute -top-2 right-4 rounded-full bg-primary text-white text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider whitespace-nowrap shadow-[0_2px_6px_-2px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.18)]">
              {plan.badge}
            </span>
          )}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            {plan.description && <p className="mt-1 text-sm text-muted">{plan.description}</p>}
          </div>
          <div className="mb-5 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight tabular-nums">{plan.price}</span>
            {plan.priceSuffix && (
              <span className="text-sm text-muted whitespace-nowrap">{plan.priceSuffix}</span>
            )}
          </div>
          <ul className="flex-1 space-y-2 mb-6">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0 mt-0.5 text-success"
                >
                  <path
                    d="M3 8l3.5 3.5L13 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
                "w-full rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer",
                "transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                plan.highlighted
                  ? "bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-primary-hover"
                  : "border border-border hover:bg-surface-soft hover:border-muted-light",
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
