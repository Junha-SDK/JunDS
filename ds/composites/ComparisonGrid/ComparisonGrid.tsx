"use client";
import { cn } from "../../utils/cn";

export interface ComparisonCard {
  key: string;
  label: string;
  value: string | number;
  subtext?: string;
  /** 차이가 있을 때 warning highlight */
  hasVariance?: boolean;
  /** 변화량 표시 */
  change?: { value: string; direction: "up" | "down" | "neutral" };
}

export interface ComparisonGridProps {
  /** 비교 카드 목록 */
  cards: ComparisonCard[];
  /** 그리드 컬럼 수 */
  columns?: 2 | 3 | 4;
  /** 추가 클래스 */
  className?: string;
}

const columnStyles: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
};

/**
 * 비교 지표 그리드
 * @description 통계 카드를 그리드로 배치하여 지표를 비교할 수 있는 컴포넌트
 * @example
 * <ComparisonGrid
 *   cards={[
 *     { key: "total", label: "전체", value: 1200 },
 *     { key: "diff", label: "차이", value: 3, hasVariance: true, change: { value: "+3", direction: "up" } },
 *   ]}
 * />
 * @status stable
 * @since 2.2.0
 * @tags data
 */
export function ComparisonGrid({ cards, columns = 4, className }: ComparisonGridProps) {
  return (
    <div className={cn("grid gap-4", columnStyles[columns], className)}>
      {cards.map((card) => (
        <div
          key={card.key}
          className={cn(
            "border rounded-xl p-4 bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
            card.hasVariance
              ? "border-l-[3px] border-l-amber-400 border-t-border border-r-border border-b-border bg-amber-50/40 hover:shadow-amber-200/50"
              : "border-border",
          )}
        >
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
            {card.label}
          </span>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-xl font-bold text-foreground tabular-nums">{card.value}</span>
            {card.change && (
              <span
                className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded-md mb-0.5",
                  card.change.direction === "up" && "text-success bg-success-light",
                  card.change.direction === "down" && "text-danger bg-danger-light",
                  card.change.direction === "neutral" && "text-muted bg-gray-100",
                )}
              >
                {card.change.direction === "up" && "↑"}
                {card.change.direction === "down" && "↓"}
                {card.change.value}
              </span>
            )}
          </div>
          {card.subtext && <p className="text-xs text-muted mt-1">{card.subtext}</p>}
        </div>
      ))}
    </div>
  );
}
