"use client";

import React from "react";
import { cn } from "../../utils";

/**
 * CSS columns 기반 메이슨리 그리드
 *
 * - CSS `columns` 속성으로 진정한 메이슨리 레이아웃
 * - `break-inside: avoid`로 아이템 분리 방지
 * - 반응형 컬럼 수 지원
 */
export interface MasonryGridProps {
  /** 자식 요소 */
  children: React.ReactNode;
  /** 컬럼 수 */
  columns?: 2 | 3 | 4;
  /** 아이템 간격 (px) */
  gap?: number;
  /** 추가 클래스 */
  className?: string;
}

const columnClasses: Record<2 | 3 | 4, string> = {
  2: "columns-1 sm:columns-2",
  3: "columns-1 sm:columns-2 lg:columns-3",
  4: "columns-1 sm:columns-2 lg:columns-3 xl:columns-4",
};

/**
 * 핀터레스트 스타일의 메이슨리(masonry) 그리드 레이아웃.
 * @example
 * <MasonryGrid columns={3} gap={16}>
 *   {items.map(item => <Card key={item.id}>{item.content}</Card>)}
 * </MasonryGrid>
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export function MasonryGrid({
  children,
  columns = 3,
  gap = 16,
  className,
}: MasonryGridProps) {
  return (
    <div
      className={cn(columnClasses[columns], className)}
      style={{ columnGap: gap }}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return (
          <div
            className="break-inside-avoid"
            style={{ marginBottom: gap }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
