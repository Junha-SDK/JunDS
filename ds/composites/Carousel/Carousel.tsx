"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface CarouselProps {
  /** 슬라이드 항목 */
  children: ReactNode[];
  /** 자동 재생 */
  autoPlay?: boolean;
  /** 자동 재생 간격 (ms) */
  interval?: number;
  /** 하단 도트 표시 */
  showDots?: boolean;
  /** 좌우 화살표 표시 */
  showArrows?: boolean;
  /** 무한 반복 */
  loop?: boolean;
  className?: string;
}

/**
 * 캐러셀
 * CSS scroll-snap 기반의 이미지/카드 슬라이더
 * @example
 * <Carousel showDots showArrows autoPlay interval={3000}>
 *   <img src="/a.jpg" /><img src="/b.jpg" />
 * </Carousel>
 */
export function Carousel({
  children,
  autoPlay = false,
  interval = 4000,
  showDots = true,
  showArrows = true,
  loop = true,
  className,
}: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const count = children.length;

  const scrollTo = useCallback(
    (index: number) => {
      let target = index;
      if (loop) {
        target = ((index % count) + count) % count;
      } else {
        target = Math.max(0, Math.min(index, count - 1));
      }
      setCurrent(target);
      scrollRef.current?.children[target]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    },
    [count, loop],
  );

  const prev = useCallback(() => scrollTo(current - 1), [current, scrollTo]);
  const next = useCallback(() => scrollTo(current + 1), [current, scrollTo]);

  useEffect(() => {
    if (!autoPlay || count <= 1) return;
    const timer = setInterval(() => {
      scrollTo(current + 1);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, current, count, scrollTo]);

  return (
    <div className={cn("relative group", className)}>
      {/* 슬라이드 컨테이너 */}
      <div
        ref={scrollRef}
        className="flex overflow-x-hidden snap-x snap-mandatory scroll-smooth"
      >
        {children.map((child, i) => (
          <div key={i} className="w-full flex-shrink-0 snap-start">
            {child}
          </div>
        ))}
      </div>

      {/* 이전/다음 화살표 */}
      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center",
              "rounded-full bg-white/80 border border-border shadow-sm text-foreground",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-white",
            )}
            aria-label="이전 슬라이드"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center",
              "rounded-full bg-white/80 border border-border shadow-sm text-foreground",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-white",
            )}
            aria-label="다음 슬라이드"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* 도트 인디케이터 */}
      {showDots && count > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all cursor-pointer",
                i === current ? "bg-foreground w-4" : "bg-border hover:bg-muted",
              )}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
