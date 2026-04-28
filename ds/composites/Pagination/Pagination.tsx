"use client";
import { forwardRef, useMemo } from "react";
import { cn } from "../../utils/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** 보여줄 페이지 수 */
  siblings?: number;
  className?: string;
}

/**
 * 페이지네이션
 * @example
 * <Pagination page={1} totalPages={10} onChange={setPage} />
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ page, totalPages, onChange, siblings = 1, className }, ref) => {
  const pages = useMemo(() => {
    const items: (number | "...")[] = [];
    const start = Math.max(2, page - siblings);
    const end = Math.min(totalPages - 1, page + siblings);

    items.push(1);
    if (start > 2) items.push("...");
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages - 1) items.push("...");
    if (totalPages > 1) items.push(totalPages);

    return items;
  }, [page, totalPages, siblings]);

  if (totalPages <= 1) return null;

  const btnClass = (active: boolean) =>
    cn(
      "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer",
      active
        ? "bg-primary text-white shadow-sm"
        : "text-muted hover:bg-gray-100 hover:text-foreground",
    );

  return (
    <nav ref={ref} className={cn("flex items-center gap-1", className)} aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={btnClass(p === page)}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
},
);
Pagination.displayName = "Pagination";
