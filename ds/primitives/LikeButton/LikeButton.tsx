"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes } from "react";

export interface LikeButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** 좋아요 활성 상태 */
  liked: boolean;
  /** 토글 콜백 */
  onChange: (liked: boolean) => void;
  /** 좋아요 수 (옆에 표시) */
  count?: number;
  /** 크기 */
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { btn: "h-7 px-2 text-xs", icon: 14 },
  md: { btn: "h-9 px-3 text-sm", icon: 16 },
  lg: { btn: "h-11 px-4 text-base", icon: 20 },
} as const;

/**
 * 좋아요 토글 — 활성화 시 하트 채움 + 살짝 스케일 애니메이션.
 * @example
 * <LikeButton liked={liked} onChange={setLiked} count={likes} />
 * @status stable
 * @since 2.4.0
 * @tags sns, control
 */
export const LikeButton = forwardRef<HTMLButtonElement, LikeButtonProps>(
  ({ liked, onChange, count, size = "md", className, ...props }, ref) => {
    const s = sizeMap[size];
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={liked}
        aria-label={liked ? "좋아요 취소" : "좋아요"}
        onClick={() => onChange(!liked)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium transition-all cursor-pointer select-none",
          "hover:bg-surface-soft active:scale-95 motion-reduce:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40",
          liked ? "text-rose-500" : "text-muted",
          s.btn,
          className,
        )}
        {...props}
      >
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
          className={cn("transition-transform duration-200", liked && "scale-110 motion-reduce:scale-100")}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        {count !== undefined && <span className="tabular-nums">{count.toLocaleString()}</span>}
      </button>
    );
  },
);
LikeButton.displayName = "LikeButton";
