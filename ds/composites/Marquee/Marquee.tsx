"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface MarqueeProps {
  /** 흐를 콘텐츠 */
  children: ReactNode;
  /** 한 바퀴 도는 속도(초) */
  speed?: number;
  /** 흐름 방향 */
  direction?: "left" | "right";
  /** 호버 시 일시 정지 여부 */
  pauseOnHover?: boolean;
  /** 항목 사이 간격(px) */
  gap?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 가로 방향으로 무한 스크롤되는 텍스트/요소 표시기.
 * @example
 * <Marquee speed={20} pauseOnHover>
 *   <span>NEW</span><span>SALE</span>
 * </Marquee>
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function Marquee({
  children,
  speed = 30,
  direction = "left",
  pauseOnHover = true,
  gap = 48,
  className,
}: MarqueeProps) {
  const animDir = direction === "left" ? "normal" : "reverse";

  return (
    <div className={cn("overflow-hidden", className)} role="marquee" aria-live="off">
      <div
        className={cn("flex w-max", pauseOnHover && "hover:[animation-play-state:paused]")}
        style={{
          animation: `marquee-scroll ${speed}s linear infinite ${animDir}`,
          gap,
        }}
      >
        <div className="flex shrink-0" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
