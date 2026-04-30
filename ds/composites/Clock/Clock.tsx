"use client";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type ClockMode = "digital" | "analog";

export interface ClockProps extends HTMLAttributes<HTMLDivElement> {
  /** 표시 형식 */
  mode?: ClockMode;
  /** 24시간제 (digital 전용) */
  hour24?: boolean;
  /** 초 표시 여부 */
  showSeconds?: boolean;
  /** 시간대 (IANA, 예: "Asia/Seoul") */
  timeZone?: string;
  /** 아날로그 크기(px) */
  size?: number;
}

/**
 * 라이브 시계 (디지털/아날로그).
 * @example
 * <Clock mode="digital" showSeconds />
 * <Clock mode="analog" size={140} timeZone="America/New_York" />
 * @status stable
 * @since 2.3.0
 * @tags data-display
 */
export const Clock = forwardRef<HTMLDivElement, ClockProps>(function Clock(
  { mode = "digital", hour24 = true, showSeconds = true, timeZone, size = 120, className, ...props },
  ref,
) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (mode === "digital") {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: !hour24,
      timeZone,
    });
    return (
      <div ref={ref} className={cn("inline-flex items-baseline gap-2 font-mono tabular-nums", className)} {...props}>
        <span className="text-2xl font-semibold">{fmt.format(now)}</span>
      </div>
    );
  }

  const parts = timeZone
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric", minute: "numeric", second: "numeric", hour12: false, timeZone,
      }).formatToParts(now)
    : null;
  const get = (t: string) => (parts ? Number(parts.find((p) => p.type === t)?.value ?? 0) : 0);
  const h = parts ? get("hour") : now.getHours();
  const m = parts ? get("minute") : now.getMinutes();
  const s = parts ? get("second") : now.getSeconds();

  const hAng = ((h % 12) + m / 60) * 30;
  const mAng = (m + s / 60) * 6;
  const sAng = s * 6;
  const r = size / 2;

  return (
    <div ref={ref} className={cn("inline-block", className)} {...props}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="시계">
        <circle cx={r} cy={r} r={r - 2} className="fill-surface stroke-border" strokeWidth={2} />
        {[...Array(12)].map((_, i) => {
          const a = (i * 30 - 90) * (Math.PI / 180);
          const x1 = r + (r - 6) * Math.cos(a);
          const y1 = r + (r - 6) * Math.sin(a);
          const x2 = r + (r - 12) * Math.cos(a);
          const y2 = r + (r - 12) * Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-foreground" strokeWidth={1.5} />;
        })}
        <line x1={r} y1={r} x2={r} y2={r - r * 0.5} className="stroke-foreground" strokeWidth={3} strokeLinecap="round" transform={`rotate(${hAng} ${r} ${r})`} />
        <line x1={r} y1={r} x2={r} y2={r - r * 0.7} className="stroke-foreground" strokeWidth={2} strokeLinecap="round" transform={`rotate(${mAng} ${r} ${r})`} />
        {showSeconds && (
          <line x1={r} y1={r} x2={r} y2={r - r * 0.8} className="stroke-primary" strokeWidth={1} strokeLinecap="round" transform={`rotate(${sAng} ${r} ${r})`} />
        )}
        <circle cx={r} cy={r} r={3} className="fill-primary" />
      </svg>
    </div>
  );
});
