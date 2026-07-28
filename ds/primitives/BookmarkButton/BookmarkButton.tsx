"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes } from "react";

export interface BookmarkButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  bookmarked: boolean;
  onChange: (bookmarked: boolean) => void;
  size?: number;
}

/**
 * 북마크 토글.
 * @example
 * <BookmarkButton bookmarked={saved} onChange={setSaved} />
 * @status stable
 * @since 2.4.0
 * @tags book, control
 */
export const BookmarkButton = forwardRef<HTMLButtonElement, BookmarkButtonProps>(
  ({ bookmarked, onChange, size = 18, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "북마크 해제" : "북마크 추가"}
      onClick={() => onChange(!bookmarked)}
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-1.5 cursor-pointer",
        // transform 이 섞이므로 감속 요청을 받는다. all 이면 padding 까지 전이 대상이 된다.
        "transition-[color,background-color,transform] duration-200 ease-out motion-reduce:transition-none",
        "hover:bg-muted/10 hover:text-primary-ink active:scale-95 active:bg-muted/15",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // 북마크 금색은 이 컨트롤의 정체성 색이라 두 모드 모두에서 유지한다.
        bookmarked ? "text-amber-500 hover:text-amber-500" : "text-muted",
        className,
      )}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        aria-hidden="true"
        className="transition-transform duration-200 ease-out motion-reduce:transition-none"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  ),
);
BookmarkButton.displayName = "BookmarkButton";
