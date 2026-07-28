"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface PollOption {
  id: string;
  label: ReactNode;
  votes: number;
}

export interface PollCardProps {
  /** 질문 */
  question: ReactNode;
  /** 옵션 */
  options: PollOption[];
  /** 사용자가 투표한 옵션 id (null 이면 미투표) */
  votedId?: string | null;
  /** 투표 콜백 */
  onVote?: (id: string) => void;
  /** 마감까지 남은 텍스트 */
  closesIn?: string;
  /** 결과를 항상 보여줄지 (false면 투표 후만) */
  alwaysShowResults?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 투표 카드 — 단일 선택 + 결과 막대 + 마감 표시.
 * @example
 * <PollCard question="가장 좋아하는 색은?" options={opts} votedId={voted} onVote={v} closesIn="2일 남음" />
 * @status stable
 * @since 2.4.0
 * @tags sns, content
 */
export const PollCard = forwardRef<HTMLElement, PollCardProps>(
  ({ question, options, votedId, onVote, closesIn, alwaysShowResults, className }, ref) => {
    const total = options.reduce((s, o) => s + o.votes, 0);
    const voted = votedId != null;
    const showResults = voted || alwaysShowResults;

    return (
      <article
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-surface p-4",
          "shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.12)]",
          className,
        )}
      >
        <p className="text-sm font-semibold text-foreground">{question}</p>
        <ul className="mt-3 space-y-2">
          {options.map((opt) => {
            const pct = total > 0 ? (opt.votes / total) * 100 : 0;
            const mine = votedId === opt.id;
            const top = options.every((o) => o.votes <= opt.votes) && opt.votes > 0;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => !voted && onVote?.(opt.id)}
                  disabled={voted}
                  aria-pressed={mine}
                  className={cn(
                    "relative w-full overflow-hidden rounded-xl text-sm border text-left cursor-pointer",
                    "px-3 py-2 transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                    mine
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-primary/5",
                    voted && "cursor-default",
                  )}
                >
                  {showResults && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        // 막대가 자라는 건 움직임이다 — 감속 요청이면 즉시 최종 너비로
                        "absolute inset-y-0 left-0 transition-[width] duration-500 motion-reduce:transition-none",
                        mine ? "bg-primary/15" : top ? "bg-warning/20" : "bg-muted/15",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  <span className="relative flex items-center justify-between gap-2 min-w-0">
                    <span className="flex items-center gap-2 min-w-0 truncate">
                      {mine && <span aria-hidden="true">✓</span>}
                      {opt.label}
                    </span>
                    {showResults && (
                      <span className="shrink-0 whitespace-nowrap text-xs text-muted tabular-nums">
                        {Math.round(pct)}% · {opt.votes.toLocaleString()}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <footer className="mt-3 flex items-center justify-between text-[11px] text-muted">
          <span>{total.toLocaleString()}표</span>
          {closesIn && <span>{closesIn}</span>}
        </footer>
      </article>
    );
  },
);
PollCard.displayName = "PollCard";
