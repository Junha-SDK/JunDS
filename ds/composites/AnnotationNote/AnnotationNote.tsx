"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export type AnnotationColor = "yellow" | "green" | "blue" | "pink" | "orange";

export interface AnnotationNoteProps {
  quote: ReactNode;
  note?: ReactNode;
  createdAt?: string | Date;
  page?: number;
  color?: AnnotationColor;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

const colorMap: Record<AnnotationColor, string> = {
  yellow: "border-l-yellow-400 bg-yellow-50 dark:bg-yellow-950/30",
  green: "border-l-green-400 bg-green-50 dark:bg-green-950/30",
  blue: "border-l-blue-400 bg-blue-50 dark:bg-blue-950/30",
  pink: "border-l-pink-400 bg-pink-50 dark:bg-pink-950/30",
  orange: "border-l-orange-400 bg-orange-50 dark:bg-orange-950/30",
};

function formatDate(d?: string | Date) {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ko", { year: "2-digit", month: "short", day: "numeric" }).format(dt);
}

/**
 * 본문 하이라이트 + 사용자 메모 카드.
 * @example
 * <AnnotationNote quote="삶은…" note="중요" page={142} color="yellow" createdAt="2026-04-30" />
 * @status stable
 * @since 2.4.0
 * @tags book, content
 */
export const AnnotationNote = forwardRef<HTMLElement, AnnotationNoteProps>(
  ({ quote, note, createdAt, page, color = "yellow", onDelete, onClick, className }, ref) => {
    const dateStr = formatDate(createdAt);
    return (
      <article
        ref={ref}
        onClick={onClick}
        className={cn(
          "border-l-4 rounded-r-md p-3 text-sm",
          colorMap[color],
          onClick && "cursor-pointer hover:shadow-sm transition-shadow",
          className,
        )}
      >
        <blockquote className="text-foreground leading-relaxed">"{quote}"</blockquote>
        {note && <p className="mt-2 text-xs text-muted leading-relaxed">{note}</p>}
        <footer className="mt-2 flex items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-2">
            {page !== undefined && <span>p.{page}</span>}
            {dateStr && <span>{dateStr}</span>}
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              aria-label="메모 삭제"
              className="opacity-50 hover:opacity-100 hover:text-danger transition-opacity"
            >
              ✕
            </button>
          )}
        </footer>
      </article>
    );
  },
);
AnnotationNote.displayName = "AnnotationNote";
