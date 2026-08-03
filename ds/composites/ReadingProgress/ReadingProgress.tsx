"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface ReadingProgressProps {
  /** 현재 페이지 (1-base) */
  currentPage: number;
  /** 총 페이지 */
  totalPages: number;
  /** 챕터 제목 (선택) */
  chapter?: string;
  /** 예상 남은 시간(분) */
  remainingMinutes?: number;
  /** 컴팩트 모드 (한 줄) */
  compact?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 독서 진행률 — 현재/총 페이지, 챕터, 남은 시간 표시.
 * @example
 * <ReadingProgress currentPage={86} totalPages={312} chapter="3장. 노이즈" remainingMinutes={42} />
 * @status stable
 * @since 2.4.0
 * @tags book, feedback
 */
export const ReadingProgress = forwardRef<HTMLDivElement, ReadingProgressProps>(
  ({ currentPage, totalPages, chapter, remainingMinutes, compact, className }, ref) => {
    const pct = totalPages > 0 ? Math.min(100, Math.max(0, (currentPage / totalPages) * 100)) : 0;
    const pctRounded = Math.round(pct);

    if (compact) {
      return (
        <div ref={ref} className={cn("flex items-center gap-2 text-xs text-muted", className)}>
          <div
            role="progressbar"
            aria-valuenow={pctRounded}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="독서 진행률"
            // `dark:` 는 이 저장소에서 OS 선호도를 따르지만 테마는 [data-theme] 로 바뀐다 —
            // 둘이 어긋나면 다크 앱에서 트랙만 밝은 회색으로 남는다. border-light 가 모드를 따라간다.
            className="relative h-1 flex-1 rounded-full bg-border-light overflow-hidden"
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="tabular-nums shrink-0">{pctRounded}%</span>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("space-y-1.5", className)}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-foreground truncate">{chapter ?? "독서 진행률"}</p>
          <p className="text-xs text-muted tabular-nums shrink-0">
            <span className="font-semibold text-foreground">{currentPage}</span>
            <span className="mx-1">/</span>
            {totalPages}
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pctRounded}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="독서 진행률"
          className="relative h-2 rounded-full bg-border-light overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
        >
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-hover rounded-full transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* 숫자+단위는 좁은 칸에서 줄바꿈되면 "42" / "분 남음" 으로 찢어진다 */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
          <span className="tabular-nums whitespace-nowrap">{pctRounded}% 완료</span>
          {remainingMinutes !== undefined && (
            <span className="tabular-nums whitespace-nowrap">약 {remainingMinutes}분 남음</span>
          )}
        </div>
      </div>
    );
  },
);
ReadingProgress.displayName = "ReadingProgress";
