"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface BentoGridProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 그리드 열 수 */
  cols?: number;
  /** 셀 간격(rem 단위 4배수) */
  gap?: number;
  /** 추가 클래스 */
  className?: string;
}

export interface BentoGridItemProps {
  children: ReactNode;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2 | 3;
  className?: string;
}

const colSpanMap = { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3" };
const rowSpanMap = { 1: "row-span-1", 2: "row-span-2", 3: "row-span-3" };

/**
 * 크기가 다른 카드를 비대칭 그리드로 배치하는 벤토 레이아웃.
 * @example
 * <BentoGrid cols={3} gap="md">
 *   <BentoItem span={2}>큰 카드</BentoItem>
 *   <BentoItem>작은 카드</BentoItem>
 * </BentoGrid>
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export function BentoGrid({ children, cols = 4, gap = 4, className }: BentoGridProps) {
  const colsClass: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };
  return (
    <div
      className={cn("grid auto-rows-[180px]", colsClass[cols] ?? "grid-cols-4", className)}
      style={{ gap: `${gap * 4}px` }}
    >
      {children}
    </div>
  );
}

function BentoGridItem({ children, colSpan = 1, rowSpan = 1, className }: BentoGridItemProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 overflow-hidden",
        // 한 겹 shadow-lg 는 유령처럼 뜬다 — 평소엔 얕은 면 그림자 + 상단 인셋,
        // 호버에서 넓은 그림자와 좁은 그림자를 겹쳐 실제로 들어 올린다
        "shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.12)]",
        "transition-shadow duration-300",
        "hover:shadow-[0_14px_34px_-12px_rgba(0,0,0,0.28),0_4px_10px_-4px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.14)]",
        colSpanMap[colSpan],
        rowSpanMap[rowSpan],
        className,
      )}
    >
      {children}
    </div>
  );
}

BentoGrid.Item = BentoGridItem;
