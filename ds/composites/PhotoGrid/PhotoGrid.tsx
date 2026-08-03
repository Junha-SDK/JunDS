"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Slot } from "../../utils/Slot";
import type { HTMLAttributes, ReactNode } from "react";

export type PhotoGridLayout = "uniform" | "masonry" | "mosaic";

export interface PhotoGridProps extends HTMLAttributes<HTMLDivElement> {
  /** 사진 카드들 */
  children: ReactNode;
  /** 레이아웃 모드 */
  layout?: PhotoGridLayout;
  /** 컬럼 수 */
  columns?: 2 | 3 | 4 | 5;
  /** 간격 (Tailwind gap 키) */
  gap?: 1 | 2 | 3 | 4;
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
}

const colsMap: Record<NonNullable<PhotoGridProps["columns"]>, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
};
const gapMap: Record<NonNullable<PhotoGridProps["gap"]>, string> = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
};
const masonryColsMap: Record<NonNullable<PhotoGridProps["columns"]>, string> = {
  2: "columns-1 sm:columns-2",
  3: "columns-2 sm:columns-3",
  4: "columns-2 sm:columns-3 lg:columns-4",
  5: "columns-2 sm:columns-3 lg:columns-5",
};

/**
 * 사진 그리드 — uniform(균등), masonry(폭만 같음), mosaic(첫 항목 강조).
 * @example
 * <PhotoGrid layout="masonry" columns={4} gap={2}>
 *   {photos.map((p) => <PhotoCard key={p.id} {...p} />)}
 * </PhotoGrid>
 * @status stable
 * @since 2.4.0
 * @tags photo, layout
 */
export const PhotoGrid = forwardRef<HTMLDivElement, PhotoGridProps>(
  ({ children, layout = "uniform", columns = 3, gap = 2, asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    if (layout === "masonry") {
      return (
        <Comp
          ref={ref as never}
          className={cn(
            masonryColsMap[columns],
            gapMap[gap],
            "[&>*]:mb-2 [&>*]:break-inside-avoid",
            className,
          )}
          {...props}
        >
          {children}
        </Comp>
      );
    }
    if (layout === "mosaic") {
      return (
        <Comp
          ref={ref as never}
          className={cn(
            "grid grid-cols-4 grid-rows-2",
            gapMap[gap],
            "[&>*:first-child]:col-span-2 [&>*:first-child]:row-span-2",
            className,
          )}
          {...props}
        >
          {children}
        </Comp>
      );
    }
    return (
      <Comp
        ref={ref as never}
        className={cn("grid", colsMap[columns], gapMap[gap], className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
PhotoGrid.displayName = "PhotoGrid";
