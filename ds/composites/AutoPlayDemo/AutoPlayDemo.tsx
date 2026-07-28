"use client";
import { useState, useEffect, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface AutoPlayDemoProps {
  /** 순환할 프레임들 (각 프레임은 ReactNode) */
  frames: ReactNode[];
  /** 프레임 전환 간격 (ms) */
  interval?: number;
  /** 전환 애니메이션 */
  transition?: "fade" | "slide-up" | "slide-left" | "scale" | "crossfade" | "none";
  /** 전환 지속 시간 (ms) */
  duration?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 자동 순환 데모
 * 여러 상태/프레임을 자동으로 순환하며 컴포넌트의 다양한 모습을 보여줍니다.
 *
 * @example
 * <AutoPlayDemo
 *   frames={[
 *     <Button variant="primary">Primary</Button>,
 *     <Button variant="danger">Danger</Button>,
 *     <Button variant="ghost">Ghost</Button>,
 *   ]}
 *   interval={1000}
 *   transition="fade"
 * />
 * @status stable
 * @since 2.2.0
 * @tags misc
 */
export function AutoPlayDemo({
  frames,
  interval = 1500,
  transition = "fade",
  duration = 400,
  className,
}: AutoPlayDemoProps) {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);

  useEffect(() => {
    if (frames.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => {
        setPrevious(prev);
        return (prev + 1) % frames.length;
      });
    }, interval);
    return () => clearInterval(id);
  }, [frames.length, interval]);

  // Clear previous frame after transition completes
  useEffect(() => {
    if (previous === null) return;
    const id = setTimeout(() => setPrevious(null), duration);
    return () => clearTimeout(id);
  }, [previous, duration]);

  const transitionStyles = {
    fade: { enter: "opacity-100", exit: "opacity-0" },
    "slide-up": { enter: "opacity-100 translate-y-0", exit: "opacity-0 translate-y-3" },
    "slide-left": { enter: "opacity-100 translate-x-0", exit: "opacity-0 translate-x-4" },
    scale: { enter: "opacity-100 scale-100", exit: "opacity-0 scale-90" },
    crossfade: { enter: "opacity-100", exit: "opacity-0" },
    none: { enter: "", exit: "" },
  };

  const t = transitionStyles[transition];

  return (
    <div className={cn("relative w-full", className)}>
      {frames.map((frame, i) => {
        const isActive = i === current;
        const isLeaving = i === previous;
        const isVisible = isActive || isLeaving;

        return (
          <div
            key={i}
            className={cn(
              // 프레임 전환에서 변하는 건 투명도와 위치뿐이다. `all` 로 두면 프레임 안쪽
              // 컴포넌트의 크기 변화까지 같이 전이되어 내용이 흐물거린다.
              "transition-[opacity,transform] pointer-events-none motion-reduce:transition-none",
              i === 0 ? "relative" : "absolute inset-0",
              isActive ? t.enter : t.exit,
            )}
            style={{
              transitionDuration: `${duration}ms`,
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              visibility: isVisible ? "visible" : "hidden",
            }}
          >
            {frame}
          </div>
        );
      })}
    </div>
  );
}
