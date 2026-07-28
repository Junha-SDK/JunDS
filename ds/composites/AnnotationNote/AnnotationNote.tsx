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

// 형광펜 색은 정체성이라 색상(hue)은 그대로 둔다. 다만 이 저장소는 다크를
// `[data-theme]` 로 켜므로 Tailwind 의 `dark:` 변형은 아무것도 하지 않았다 —
// -50 배경이 다크에서 그대로 밝게 남았다. 알파 배경으로 옮기면 두 모드 다 성립한다.
const colorMap: Record<AnnotationColor, string> = {
  yellow: "border-l-yellow-400 bg-yellow-400/12",
  green: "border-l-green-400 bg-green-400/12",
  blue: "border-l-blue-400 bg-blue-400/12",
  pink: "border-l-pink-400 bg-pink-400/12",
  orange: "border-l-orange-400 bg-orange-400/12",
};

function formatDate(d?: string | Date) {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ko", { year: "2-digit", month: "short", day: "numeric" }).format(
    dt,
  );
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
        // 클릭 가능한데 키보드로는 닿지 않았다. role 을 button 으로 바꾸면 안쪽 삭제
        // 버튼과 충돌하므로 article 을 유지한 채 탭 순서에만 넣는다.
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={cn(
          "border-l-4 rounded-r-xl p-3 text-sm",
          colorMap[color],
          onClick &&
            "cursor-pointer transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        <blockquote className="text-foreground leading-relaxed">"{quote}"</blockquote>
        {note && <p className="mt-2 text-xs text-muted leading-relaxed">{note}</p>}
        <footer className="mt-2 flex items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-2 min-w-0">
            {page !== undefined && <span className="tabular-nums whitespace-nowrap">p.{page}</span>}
            {dateStr && <span className="whitespace-nowrap">{dateStr}</span>}
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="메모 삭제"
              className="shrink-0 rounded-md px-1 opacity-50 cursor-pointer transition-[opacity,color] hover:opacity-100 hover:text-danger focus-visible:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-danger/55"
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
