"use client";
import { useEffect, useState, useRef } from "react";
import { cn } from "../../utils/cn";

export interface AnimatedCounterProps {
  /** 표시할 숫자 값 */
  value: number;
  /** 애니메이션 지속 시간(ms) */
  duration?: number;
  /** 소수점 자릿수 */
  decimals?: number;
  /** 숫자 앞 접두어 */
  prefix?: string;
  /** 숫자 뒤 접미어 */
  suffix?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 숫자가 부드럽게 증가/감소하며 표시되는 카운터.
 * @example
 * <AnimatedCounter value={1234} duration={1500} suffix="원" />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function AnimatedCounter({
  value,
  duration = 1500,
  decimals = 0,
  prefix,
  suffix,
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number>(0);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = performance.now();
    const diff = value - fromRef.current;

    const step = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = fromRef.current + diff * eased;
      setDisplay(Number(current.toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(Number(value.toFixed(decimals)));
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration, decimals]);

  const formatted = new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(display);

  return (
    <span className={cn("tabular-nums font-bold", className)} aria-live="polite">
      {prefix}
      {formatted.split("").map((char, i) => (
        <span
          key={`${i}-${char}`}
          className="inline-block transition-transform duration-300"
          style={{ transform: "translateY(0)" }}
        >
          {char}
        </span>
      ))}
      {suffix}
    </span>
  );
}
