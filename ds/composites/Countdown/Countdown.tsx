"use client";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type CountdownFormat = "full" | "compact" | "minimal";

export interface CountdownProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 만료 시각 (Date 또는 ISO 문자열 또는 timestamp) */
  to: Date | string | number;
  /** 표시 형식 */
  format?: CountdownFormat;
  /** 일/시/분/초 라벨 */
  labels?: { d?: string; h?: string; m?: string; s?: string };
  /** 만료 시 콜백 */
  onComplete?: () => void;
  /** 만료 시 표시할 내용 */
  completedContent?: ReactNode;
}

interface Parts {
  d: number; h: number; m: number; s: number; done: boolean;
}

function compute(target: number): Parts {
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    done: diff === 0,
  };
}

const pad = (n: number) => n.toString().padStart(2, "0");

/**
 * 카운트다운 타이머. 1초 간격으로 갱신.
 * @example
 * <Countdown to="2026-12-31T23:59:59Z" onComplete={() => alert('done')} />
 * @status stable
 * @since 2.3.0
 * @tags feedback
 */
export const Countdown = forwardRef<HTMLDivElement, CountdownProps>(function Countdown(
  { to, format = "full", labels, onComplete, completedContent, className, ...props },
  ref,
) {
  const target = typeof to === "number" ? to : new Date(to).getTime();
  const [parts, setParts] = useState<Parts>(() => compute(target));

  useEffect(() => {
    if (parts.done) return;
    const id = window.setInterval(() => {
      const next = compute(target);
      setParts(next);
      if (next.done) {
        window.clearInterval(id);
        onComplete?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [target, onComplete, parts.done]);

  if (parts.done && completedContent !== undefined) {
    return <div ref={ref} className={className} {...props}>{completedContent}</div>;
  }

  const lbl = { d: labels?.d ?? "일", h: labels?.h ?? "시", m: labels?.m ?? "분", s: labels?.s ?? "초" };

  if (format === "minimal") {
    return (
      <div ref={ref} className={cn("font-mono tabular-nums text-sm", className)} {...props}>
        {parts.d > 0 && `${parts.d}:`}{pad(parts.h)}:{pad(parts.m)}:{pad(parts.s)}
      </div>
    );
  }

  if (format === "compact") {
    return (
      <div ref={ref} className={cn("inline-flex items-baseline gap-1 font-mono tabular-nums", className)} {...props}>
        {parts.d > 0 && <span>{parts.d}{lbl.d}</span>}
        <span>{pad(parts.h)}{lbl.h}</span>
        <span>{pad(parts.m)}{lbl.m}</span>
        <span>{pad(parts.s)}{lbl.s}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("inline-flex items-center gap-3", className)} {...props}>
      {(["d", "h", "m", "s"] as const).map((k) => (
        <div key={k} className="flex flex-col items-center min-w-[48px] rounded-md border border-border bg-surface px-3 py-2">
          <div className="text-xl font-semibold tabular-nums font-mono leading-none">{pad(parts[k])}</div>
          <div className="text-[10px] text-muted mt-1 uppercase tracking-wider">{lbl[k]}</div>
        </div>
      ))}
    </div>
  );
});
