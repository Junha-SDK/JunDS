"use client";
import { forwardRef, useEffect, useRef, useState } from "react";
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
  d: number;
  h: number;
  m: number;
  s: number;
  done: boolean;
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
 * 서버 렌더와 클라이언트 첫 렌더가 반드시 같아야 해서 쓰는 고정 시작값.
 * Date.now() 는 렌더 단계가 아니라 마운트 이후 effect 에서만 부른다.
 */
const ZERO: Parts = { d: 0, h: 0, m: 0, s: 0, done: false };

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
  // 렌더 단계에서 Date.now() 를 부르면 서버 산출물과 하이드레이션이 어긋난다.
  // 첫 렌더는 두 쪽 모두 0 으로 고정하고, 실제 값은 마운트 직후 effect 가 채운다.
  const [parts, setParts] = useState<Parts>(ZERO);

  // 인라인 콜백을 의존성에 두면 렌더마다 인터벌이 새로 걸려 초 단위가 밀린다
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const tick = () => {
      const next = compute(target);
      setParts(next);
      return next.done;
    };
    if (tick()) {
      onCompleteRef.current?.();
      return;
    }
    const id = window.setInterval(() => {
      if (tick()) {
        window.clearInterval(id);
        onCompleteRef.current?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (parts.done && completedContent !== undefined) {
    return (
      <div ref={ref} className={className} {...props}>
        {completedContent}
      </div>
    );
  }

  const lbl = {
    d: labels?.d ?? "일",
    h: labels?.h ?? "시",
    m: labels?.m ?? "분",
    s: labels?.s ?? "초",
  };

  if (format === "minimal") {
    return (
      <div ref={ref} className={cn("font-mono tabular-nums text-sm", className)} {...props}>
        {parts.d > 0 && `${parts.d}:`}
        {pad(parts.h)}:{pad(parts.m)}:{pad(parts.s)}
      </div>
    );
  }

  if (format === "compact") {
    return (
      <div
        ref={ref}
        className={cn("inline-flex items-baseline gap-1 font-mono tabular-nums", className)}
        {...props}
      >
        {parts.d > 0 && (
          <span>
            {parts.d}
            {lbl.d}
          </span>
        )}
        <span>
          {pad(parts.h)}
          {lbl.h}
        </span>
        <span>
          {pad(parts.m)}
          {lbl.m}
        </span>
        <span>
          {pad(parts.s)}
          {lbl.s}
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("inline-flex items-center gap-3", className)} {...props}>
      {(["d", "h", "m", "s"] as const).map((k) => (
        <div
          key={k}
          className={cn(
            "flex flex-col items-center min-w-[48px] rounded-xl border border-border bg-surface px-3 py-2",
            // 숫자 칸은 면이 있는 요소 — 얕은 그림자 + 상단 인셋 하이라이트
            "shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.12)]",
          )}
        >
          <div className="text-xl font-semibold tabular-nums font-mono leading-none">
            {pad(parts[k])}
          </div>
          <div className="text-[10px] text-muted mt-1 uppercase tracking-wider whitespace-nowrap">
            {lbl[k]}
          </div>
        </div>
      ))}
    </div>
  );
});
