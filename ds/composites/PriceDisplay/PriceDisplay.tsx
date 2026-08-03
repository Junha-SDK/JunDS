"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type PriceSize = "sm" | "md" | "lg" | "xl";
export type PriceLayout = "inline" | "stacked";

export interface PriceDisplayProps extends HTMLAttributes<HTMLDivElement> {
  /** 현재가 (숫자 또는 미리 포맷된 문자열) */
  value: number | string;
  /** 원가 (할인 표시용) */
  original?: number | string;
  /** 통화 코드 (Intl.NumberFormat) — value가 숫자일 때만 사용 */
  currency?: string;
  /** 로케일 */
  locale?: string;
  /** 단위 접미사 (예: "/월") */
  suffix?: string;
  /** 크기 */
  size?: PriceSize;
  /** 할인 라벨 자동 계산 노출 */
  showDiscount?: boolean;
  /** 레이아웃 */
  layout?: PriceLayout;
}

const sizeMap: Record<PriceSize, { current: string; original: string }> = {
  sm: { current: "text-sm", original: "text-xs" },
  md: { current: "text-base", original: "text-xs" },
  lg: { current: "text-xl", original: "text-sm" },
  xl: { current: "text-3xl", original: "text-base" },
};

function format(v: number | string, currency?: string, locale = "ko-KR"): string {
  if (typeof v === "string") return v;
  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(v);
  }
  return new Intl.NumberFormat(locale).format(v);
}

/**
 * 가격 표시 — 통화 포맷 + 할인 원가 + 할인율 자동 계산.
 * @example
 * <PriceDisplay value={29000} original={49000} currency="KRW" showDiscount />
 * @status stable
 * @since 2.3.0
 * @tags ecommerce
 */
export const PriceDisplay = forwardRef<HTMLDivElement, PriceDisplayProps>(function PriceDisplay(
  {
    value,
    original,
    currency,
    locale,
    suffix,
    size = "md",
    showDiscount = true,
    layout = "inline",
    className,
    ...props
  },
  ref,
) {
  const sz = sizeMap[size];
  const fmtCurrent = format(value, currency, locale);
  const fmtOriginal = original !== undefined ? format(original, currency, locale) : null;

  const discountPct =
    typeof value === "number" && typeof original === "number" && original > 0
      ? Math.round(((original - value) / original) * 100)
      : null;

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex flex-wrap",
        layout === "inline" ? "items-baseline gap-1.5" : "flex-col gap-0.5",
        className,
      )}
      {...props}
    >
      {showDiscount && discountPct !== null && discountPct > 0 && (
        <span
          className={cn(
            "font-bold text-danger tabular-nums",
            sz.current === "text-3xl" ? "text-2xl" : sz.current,
          )}
        >
          {discountPct}%
        </span>
      )}
      <span className={cn("font-bold tabular-nums", sz.current)}>
        {fmtCurrent}
        {suffix && <span className="ml-0.5 text-xs font-normal text-muted">{suffix}</span>}
      </span>
      {fmtOriginal && (
        <span className={cn("text-muted line-through tabular-nums", sz.original)}>
          {fmtOriginal}
        </span>
      )}
    </div>
  );
});
