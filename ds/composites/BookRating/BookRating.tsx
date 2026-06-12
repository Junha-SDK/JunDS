"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface BookRatingProps {
  value: number;
  max?: number;
  reviews?: number;
  distribution?: number[];
  compact?: boolean;
  className?: string;
}

function Stars({ value, max }: { value: number; max: number }) {
  const full = Math.floor(value);
  const partial = value - full;
  return (
    <div className="inline-flex items-center" aria-hidden="true">
      {Array.from({ length: max }).map((_, i) => {
        const fill = i < full ? 1 : i === full ? partial : 0;
        return (
          <span key={i} className="relative inline-block w-4 h-4 text-amber-400">
            <svg viewBox="0 0 20 20" className="absolute inset-0 fill-gray-300 dark:fill-gray-700"><path d="M10 1.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L10 14.7 4.8 17.5l1-5.8L1.5 7.6l5.9-.8z" /></svg>
            <svg viewBox="0 0 20 20" className="absolute inset-0 fill-amber-400" style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}><path d="M10 1.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L10 14.7 4.8 17.5l1-5.8L1.5 7.6l5.9-.8z" /></svg>
          </span>
        );
      })}
    </div>
  );
}

/**
 * 책 평점 — 평균 + 별 + (선택) 점수 분포 막대.
 * @example
 * <BookRating value={4.3} reviews={1820} distribution={[20,40,180,520,1060]} />
 * @status stable
 * @since 2.4.0
 * @tags book, rating
 */
export const BookRating = forwardRef<HTMLDivElement, BookRatingProps>(
  ({ value, max = 5, reviews, distribution, compact, className }, ref) => {
    const total = distribution?.reduce((s, n) => s + n, 0) ?? 0;
    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)} aria-label={`${value}점, 총 ${reviews ?? 0}개 리뷰`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground tabular-nums">{value.toFixed(1)}</span>
          <Stars value={value} max={max} />
          {reviews !== undefined && <span className="text-xs text-muted">({reviews.toLocaleString()})</span>}
        </div>
        {!compact && distribution && distribution.length === max && total > 0 && (
          <div className="space-y-0.5 mt-1">
            {[...distribution].reverse().map((count, idx) => {
              const score = max - idx;
              const pct = (count / total) * 100;
              return (
                <div key={score} className="grid grid-cols-[20px_1fr_42px] items-center gap-2 text-[11px] text-muted">
                  <span className="tabular-nums text-right">{score}점</span>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="tabular-nums text-right">{count.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
BookRating.displayName = "BookRating";
