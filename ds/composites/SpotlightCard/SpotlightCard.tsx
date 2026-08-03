"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface SpotlightCardProps {
  /** 카드 내부 콘텐츠 */
  children: ReactNode;
  /** 스포트라이트 색상 */
  spotlightColor?: string;
  /** 스포트라이트 반경(px) */
  spotlightSize?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 마우스 위치에 스포트라이트 글로우가 따라오는 카드.
 * @example
 * <SpotlightCard spotlightColor="rgba(59,130,246,0.2)" spotlightSize={300}>
 *   <Card>...</Card>
 * </SpotlightCard>
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export function SpotlightCard({
  children,
  spotlightColor = "rgba(var(--primary-rgb, 91, 76, 199), 0.08)",
  spotlightSize = 300,
  className,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-6",
        // 한 겹 `shadow-lg` 는 면이 아니라 유령처럼 보인다. 가까운 그림자와 먼 그림자를
        // 겹치고 위쪽 인셋 하이라이트로 면의 두께를 만든다.
        "shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]",
        "hover:shadow-[0_14px_36px_-14px_rgba(0,0,0,0.3),0_4px_10px_-6px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.14)]",
        "transition-shadow duration-300",
        className,
      )}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(${spotlightSize}px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 60%)`,
          }}
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
