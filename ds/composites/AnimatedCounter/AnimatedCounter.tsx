"use client";
import { useEffect, useState, useRef } from "react";
import { cn } from "../../utils/cn";

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1500,
  decimals = 0,
  prefix,
  suffix,
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>();
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
