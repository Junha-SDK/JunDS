"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes } from "react";

export interface BookmarkButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
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
        "inline-flex items-center justify-center rounded-md p-1.5 transition-all cursor-pointer",
        "hover:bg-surface-soft active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        bookmarked ? "text-amber-500" : "text-muted",
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
        className="transition-transform"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  ),
);
BookmarkButton.displayName = "BookmarkButton";
