"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  gap?: number;
  className?: string;
}

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
    <div
      className={cn("overflow-hidden", className)}
      role="marquee"
      aria-live="off"
    >
      <div
        className={cn(
          "flex w-max",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
        style={{
          animation: `marquee-scroll ${speed}s linear infinite ${animDir}`,
          gap,
        }}
      >
        <div className="flex shrink-0" style={{ gap }}>{children}</div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">{children}</div>
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
