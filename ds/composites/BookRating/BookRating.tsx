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
          <span key={i} className="relative inline-block w-4 h-4 shrink-0 text-amber-400">
            {/* 빈 별 바닥은 gray-300/gray-700 두 벌 대신 border 토큰 하나로 두 모드를 다 따라간다 */}
            <svg viewBox="0 0 20 20" className="absolute inset-0 fill-border">
              <path d="M10 1.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L10 14.7 4.8 17.5l1-5.8L1.5 7.6l5.9-.8z" />
            </svg>
            <svg
              viewBox="0 0 20 20"
              className="absolute inset-0 fill-amber-400"
              style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
            >
              <path d="M10 1.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L10 14.7 4.8 17.5l1-5.8L1.5 7.6l5.9-.8z" />
            </svg>
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
      <div
        ref={ref}
        className={cn("flex flex-col gap-2", className)}
        aria-label={`${value}점, 총 ${reviews ?? 0}개 리뷰`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground tabular-nums whitespace-nowrap">
            {value.toFixed(1)}
          </span>
          <Stars value={value} max={max} />
          {reviews !== undefined && (
            <span className="text-xs text-muted tabular-nums whitespace-nowrap">
              ({reviews.toLocaleString()})
            </span>
          )}
        </div>
        {!compact && distribution && distribution.length === max && total > 0 && (
          <div className="space-y-0.5 mt-1">
            {[...distribution].reverse().map((count, idx) => {
              const score = max - idx;
              const pct = (count / total) * 100;
              return (
                <div
                  key={score}
                  className="grid grid-cols-[24px_1fr_42px] items-center gap-2 text-[11px] text-muted"
                >
                  <span className="tabular-nums text-right whitespace-nowrap">{score}점</span>
                  {/* 트랙도 gray 두 벌 대신 border 토큰 하나 — 다크에서 알아서 어두워진다 */}
                  <div
                    className="h-1.5 rounded-full bg-border overflow-hidden min-w-0"
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-amber-400 rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-right whitespace-nowrap">
                    {count.toLocaleString()}
                  </span>
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
