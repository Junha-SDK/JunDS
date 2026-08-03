"use client";
import { forwardRef, useMemo } from "react";
import { cn } from "../../utils/cn";

export interface PaginationProps {
  /** 현재 페이지 */
  page: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 콜백 */
  onChange: (page: number) => void;
  /** 보여줄 페이지 수 */
  siblings?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 페이지네이션
 * @example
 * <Pagination page={1} totalPages={10} onChange={setPage} />
 * @status stable
 * @since 2.2.0
 * @tags navigation
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

    // 현재 페이지 칩은 상단 인셋 하이라이트로 눌린 면이 아니라 솟은 면으로 읽히게 한다.
    // gray-100 은 다크에서 무너지므로 hover 는 muted 틴트로 옮긴다.
    const btnClass = (active: boolean) =>
      cn(
        "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-primary text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)]"
          : "text-muted hover:bg-muted/10 hover:text-foreground",
      );

    const arrowClass =
      "w-8 h-8 flex items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-muted/10 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

    return (
      <nav ref={ref} className={cn("flex items-center gap-1", className)} aria-label="Pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="이전 페이지"
          className={arrowClass}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 4l-4 4 4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`dots-${i}`}
              className="w-8 h-8 flex items-center justify-center text-muted text-sm"
            >
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
          aria-label="다음 페이지"
          className={arrowClass}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";
