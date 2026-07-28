"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { AnchorHTMLAttributes } from "react";

export interface MentionChipProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  /** @ 없는 사용자 핸들 (예: "junha") */
  handle: string;
  /** 표시 라벨 (기본 @handle) */
  label?: string;
  /** 인증 사용자 표시 */
  verified?: boolean;
}

/**
 * 멘션 칩 — `@username` 링크 + (선택) 인증 마크. composite/Mention(에디터)과
 * 다르게 정적 표시 전용.
 * @example
 * <MentionChip handle="junha" verified href="/u/junha" />
 * @status stable
 * @since 2.4.0
 * @tags sns, content
 */
export const MentionChip = forwardRef<HTMLAnchorElement, MentionChipProps>(
  ({ handle, label, verified, className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "inline-flex items-center gap-0.5 text-primary-ink hover:underline font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm",
        className,
      )}
      {...props}
    >
      <span>{label ?? `@${handle}`}</span>
      {verified && (
        <span aria-label="인증됨" className="text-[11px]">
          ✓
        </span>
      )}
    </a>
  ),
);
MentionChip.displayName = "MentionChip";
