"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { AnchorHTMLAttributes } from "react";

export interface HashtagProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  /** # 없는 태그 (예: "design") */
  tag: string;
  /** 인기 태그 강조 */
  trending?: boolean;
  /** 게시물 수 (있으면 옆에 표시) */
  count?: number;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

/**
 * 해시태그 칩 — `#tag` 링크 + (선택) 인기 표시 / 게시물 수.
 * @example
 * <Hashtag tag="디자인시스템" trending count={3214} href="/tag/디자인시스템" />
 * @status stable
 * @since 2.4.0
 * @tags sns, content
 */
export const Hashtag = forwardRef<HTMLAnchorElement, HashtagProps>(
  ({ tag, trending, count, className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 text-primary-ink hover:underline font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm",
        className,
      )}
      {...props}
    >
      <span>#{tag}</span>
      {trending && (
        <span aria-label="인기 태그" className="text-[11px]">
          🔥
        </span>
      )}
      {count !== undefined && (
        <span className="text-[11px] text-muted tabular-nums">({formatCount(count)})</span>
      )}
    </a>
  ),
);
Hashtag.displayName = "Hashtag";
