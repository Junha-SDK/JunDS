"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type BookShelfVariant = "wood" | "minimal" | "card";

export interface BookShelfProps extends HTMLAttributes<HTMLDivElement> {
  /** 책 항목 (`BookCard` 등) */
  children: ReactNode;
  /** 행당 책 수 (기본 5) */
  columns?: 3 | 4 | 5 | 6 | 8;
  /** 시각 변형 */
  variant?: BookShelfVariant;
  /** 책장 라벨 (선반 위 카테고리) */
  label?: ReactNode;
}

const columnsMap: Record<NonNullable<BookShelfProps["columns"]>, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
  8: "grid-cols-4 sm:grid-cols-6 lg:grid-cols-8",
};

const variantMap: Record<BookShelfVariant, string> = {
  wood: "p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.08)]",
  minimal: "p-2",
  card: "p-5 rounded-xl border border-border bg-surface shadow-sm",
};

/**
 * 책장 — 동일한 너비 그리드로 책 카드를 정렬한다.
 * @example
 * <BookShelf label="베스트셀러" columns={5}>
 *   <BookCard title="..." author="..." coverImage="..." />
 *   …
 * </BookShelf>
 * @status stable
 * @since 2.4.0
 * @tags book, layout
 */
export const BookShelf = forwardRef<HTMLDivElement, BookShelfProps>(
  ({ children, columns = 5, variant = "minimal", label, className, ...props }, ref) => (
    <section
      ref={ref as never}
      className={cn(variantMap[variant], className)}
      {...(props as HTMLAttributes<HTMLElement>)}
    >
      {label && (
        <header className="mb-3 px-1 text-sm font-semibold text-foreground tracking-tight">
          {label}
        </header>
      )}
      <div className={cn("grid gap-3", columnsMap[columns])}>{children}</div>
    </section>
  ),
);
BookShelf.displayName = "BookShelf";
