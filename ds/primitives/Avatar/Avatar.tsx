"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** 이름 (이니셜 자동 추출) */
  name?: string;
  /** 이미지 URL */
  src?: string;
  /** 아바타 크기 */
  size?: AvatarSize;
  /** 온라인/오프라인 상태 점 */
  status?: "online" | "offline" | "away" | "busy";
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
  xl: "w-14 h-14 text-lg",
};

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
};

const statusDotSize: Record<AvatarSize, string> = {
  xs: "w-1.5 h-1.5 border",
  sm: "w-2 h-2 border-[1.5px]",
  md: "w-2.5 h-2.5 border-[1.5px]",
  lg: "w-3 h-3 border-2",
  xl: "w-3.5 h-3.5 border-2",
};

// 이름에서 이니셜 추출
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// 이름 기반 배경색 (해시)
function getColor(name: string): string {
  const colors = [
    "bg-gradient-to-br from-violet-100 to-violet-200/80 text-violet-700",
    "bg-gradient-to-br from-blue-100 to-blue-200/80 text-blue-700",
    "bg-gradient-to-br from-emerald-100 to-emerald-200/80 text-emerald-700",
    "bg-gradient-to-br from-amber-100 to-amber-200/80 text-amber-700",
    "bg-gradient-to-br from-rose-100 to-rose-200/80 text-rose-700",
    "bg-gradient-to-br from-cyan-100 to-cyan-200/80 text-cyan-700",
    "bg-gradient-to-br from-purple-100 to-purple-200/80 text-purple-700",
    "bg-gradient-to-br from-teal-100 to-teal-200/80 text-teal-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/**
 * 아바타 컴포넌트
 * @example
 * <Avatar name="김준하" size="md" status="online" />
 * <Avatar src="/photo.jpg" size="lg" />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { name, src, size = "md", status, className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn("relative inline-flex shrink-0", className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={name || "avatar"}
          className={cn(
            "rounded-full object-cover ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
            sizeStyles[size],
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-semibold select-none",
            "ring-1 ring-black/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(0,0,0,0.05)]",
            sizeStyles[size],
            name
              ? getColor(name)
              : "bg-gradient-to-br from-muted/15 to-muted/25 text-muted",
          )}
        >
          {name ? getInitials(name) : "?"}
        </div>
      )}
      {status && (
        <span
          className={cn(
            // 상태 점을 둘러싼 테두리는 "뒤에 깔린 표면"을 흉내 내는 것이다.
            // border-white 로 고정하면 다크에서 흰 고리만 남는다.
            "absolute bottom-0 right-0 rounded-full border-card shadow-[0_1px_2px_rgba(0,0,0,0.15)]",
            statusColors[status],
            statusDotSize[size],
          )}
        />
      )}
    </div>
  );
});

Avatar.displayName = "Avatar";
