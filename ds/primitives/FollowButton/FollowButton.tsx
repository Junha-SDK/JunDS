"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes } from "react";

export interface FollowButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** 팔로우 상태 */
  following: boolean;
  /** 변경 콜백 */
  onChange: (following: boolean) => void;
  /** 크기 */
  size?: "sm" | "md" | "lg";
  /** 팔로우 후 hover 시 "언팔로우" 라벨 노출 */
  unfollowOnHover?: boolean;
  /** 팔로우 라벨 */
  followLabel?: string;
  /** 팔로잉 라벨 */
  followingLabel?: string;
  /** 언팔로우 라벨 (hover 시) */
  unfollowLabel?: string;
}

const sizeMap = {
  sm: "h-7 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-base",
} as const;

/**
 * 팔로우 토글 — 상태별 라벨 + hover 시 언팔로우 강조.
 * @example
 * <FollowButton following={f} onChange={setF} unfollowOnHover />
 * @status stable
 * @since 2.4.0
 * @tags sns, control
 */
export const FollowButton = forwardRef<HTMLButtonElement, FollowButtonProps>(
  ({
    following, onChange, size = "md", unfollowOnHover = true,
    followLabel = "팔로우", followingLabel = "팔로잉", unfollowLabel = "언팔로우",
    className, ...props
  }, ref) => {
    const [hover, setHover] = useState(false);
    const showUnfollow = following && unfollowOnHover && hover;
    const label = following ? (showUnfollow ? unfollowLabel : followingLabel) : followLabel;

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={following}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => onChange(!following)}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "active:scale-[0.98] motion-reduce:active:scale-100",
          sizeMap[size],
          following
            ? showUnfollow
              ? "border border-rose-500 text-rose-500 bg-transparent"
              : "border border-border text-foreground bg-transparent"
            : "bg-primary text-white hover:brightness-110",
          className,
        )}
        {...props}
      >
        {label}
      </button>
    );
  },
);
FollowButton.displayName = "FollowButton";
