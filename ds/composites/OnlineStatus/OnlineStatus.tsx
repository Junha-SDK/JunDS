"use client";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type OnlineStatusValue = "online" | "away" | "busy" | "offline";
export type OnlineStatusSize = "xs" | "sm" | "md" | "lg";

export interface OnlineStatusProps extends HTMLAttributes<HTMLDivElement> {
  /** 상태 */
  status: OnlineStatusValue;
  /** 크기 */
  size?: OnlineStatusSize;
  /** 라벨 표시 */
  showLabel?: boolean;
  /** 펄스 애니메이션 (online에만) */
  pulse?: boolean;
  /** 마지막 활동 시각 (offline일 때 표시) */
  lastSeenAt?: Date | string;
  /** 커스텀 라벨 매핑 */
  labels?: Partial<Record<OnlineStatusValue, string>>;
}

const sizeMap: Record<OnlineStatusSize, number> = { xs: 6, sm: 8, md: 10, lg: 12 };

// 재실 상태는 브랜드색이 아니라 의미색이다 — 리터럴 hex 는 테마·다크에서 홀로 떠 있다
const colorMap: Record<OnlineStatusValue, string> = {
  online: "var(--success)",
  away: "var(--warning)",
  busy: "var(--danger)",
  offline: "var(--muted-light)",
};

const defaultLabels: Record<OnlineStatusValue, string> = {
  online: "온라인",
  away: "자리 비움",
  busy: "방해 금지",
  offline: "오프라인",
};

function relativeTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

/**
 * 사용자 온라인 상태 인디케이터.
 * @example
 * <OnlineStatus status="online" showLabel pulse />
 * <OnlineStatus status="offline" lastSeenAt={lastSeenDate} showLabel />
 * @status stable
 * @since 2.3.0
 * @tags social
 */
export const OnlineStatus = forwardRef<HTMLDivElement, OnlineStatusProps>(function OnlineStatus(
  {
    status,
    size = "sm",
    showLabel = false,
    pulse = false,
    lastSeenAt,
    labels,
    className,
    ...props
  },
  ref,
) {
  const px = sizeMap[size];
  const color = colorMap[status];
  const label = labels?.[status] ?? defaultLabels[status];

  // relativeTime 은 Date.now() 를 읽는다 — 렌더 단계에서 부르면 서버와 클라이언트가
  // 서로 다른 문자열을 내놓아 하이드레이션이 어긋난다. 마운트 뒤에만 계산한다
  const [relative, setRelative] = useState<string | null>(null);
  useEffect(() => {
    if (!lastSeenAt) {
      setRelative(null);
      return;
    }
    const d = lastSeenAt instanceof Date ? lastSeenAt : new Date(lastSeenAt);
    setRelative(relativeTime(d));
  }, [lastSeenAt]);

  return (
    <div ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props}>
      <span className="relative inline-block shrink-0" style={{ width: px, height: px }}>
        {pulse && status === "online" && (
          <span
            className="absolute inset-0 rounded-full animate-ping motion-reduce:animate-none"
            style={{ background: color, opacity: 0.5 }}
          />
        )}
        <span
          className="relative block w-full h-full rounded-full border-2 border-background shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
          style={{ background: color }}
        />
      </span>
      {showLabel && (
        <span className="text-xs text-muted whitespace-nowrap">
          {label}
          {status === "offline" && relative && ` · ${relative}`}
        </span>
      )}
    </div>
  );
});
