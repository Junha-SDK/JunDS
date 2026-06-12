"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import { PricingTable, type PricingPlan } from "../../composites/PricingTable";
import type { HTMLAttributes, ReactNode } from "react";

export interface PricingFAQ {
  question: ReactNode;
  answer: ReactNode;
}

export interface PricingPageProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 페이지 제목 */
  title?: ReactNode;
  /** 페이지 설명 */
  description?: ReactNode;
  /** 월간 플랜 */
  monthlyPlans: PricingPlan[];
  /** 연간 플랜 (있으면 토글 노출) */
  yearlyPlans?: PricingPlan[];
  /** 토글 라벨 */
  toggleLabels?: { monthly?: string; yearly?: string; saveLabel?: string };
  /** FAQ 리스트 */
  faqs?: PricingFAQ[];
  /** 하단 CTA 영역 */
  footerCta?: ReactNode;
}

/**
 * 마케팅용 요금제 페이지 (헤더 + 토글 + 플랜 테이블 + FAQ).
 * @example
 * <PricingPage title="요금제" monthlyPlans={[...]} yearlyPlans={[...]} faqs={[...]} />
 * @status stable
 * @since 2.3.0
 * @tags marketing
 */
export const PricingPage = forwardRef<HTMLDivElement, PricingPageProps>(function PricingPage(
  { title, description, monthlyPlans, yearlyPlans, toggleLabels, faqs, footerCta, className, ...props },
  ref,
) {
  const [yearly, setYearly] = useState(false);
  const labels = {
    monthly: toggleLabels?.monthly ?? "월간",
    yearly: toggleLabels?.yearly ?? "연간",
    saveLabel: toggleLabels?.saveLabel ?? "20% 절약",
  };
  const plans = yearly && yearlyPlans ? yearlyPlans : monthlyPlans;

  return (
    <div
      ref={ref}
      className={cn("max-w-6xl mx-auto px-4 py-10 sm:py-16", className)}
      {...props}
    >
      <div className="text-center mb-10">
        {title && <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>}
        {description && <p className="mt-3 text-base text-muted max-w-2xl mx-auto">{description}</p>}
        {yearlyPlans && (
          <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "px-4 py-1.5 text-sm rounded-full transition-colors cursor-pointer",
                !yearly ? "bg-primary text-white" : "text-foreground hover:bg-surface-soft",
              )}
            >
              {labels.monthly}
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "px-4 py-1.5 text-sm rounded-full transition-colors flex items-center gap-2 cursor-pointer",
                yearly ? "bg-primary text-white" : "text-foreground hover:bg-surface-soft",
              )}
            >
              {labels.yearly}
              <span className={cn("text-[10px] font-semibold rounded-full px-1.5 py-0.5",
                yearly ? "bg-white/20" : "bg-success/10 text-success",
              )}>
                {labels.saveLabel}
              </span>
            </button>
          </div>
        )}
      </div>

      <PricingTable plans={plans} />

      {faqs && faqs.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-center mb-6">자주 묻는 질문</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="rounded-lg border border-border bg-surface p-4 group">
                <summary className="cursor-pointer font-medium list-none flex items-center justify-between">
                  <span>{f.question}</span>
                  <span className="text-muted group-open:rotate-180 transition-transform">⌄</span>
                </summary>
                <div className="mt-3 text-sm text-muted">{f.answer}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {footerCta && (
        <section className="mt-16 text-center">{footerCta}</section>
      )}
    </div>
  );
});
