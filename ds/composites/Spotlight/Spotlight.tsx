"use client";
import { useState, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";
import type { ReactNode } from "react";

export interface SpotlightProps {
  target: string;
  active: boolean;
  padding?: number;
  className?: string;
  children?: ReactNode;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * 포커스 하이라이트 오버레이
 * @description 특정 요소를 강조하는 어두운 오버레이와 투명 컷아웃을 제공합니다.
 * @example
 * <Spotlight target="#important-section" active={isHighlighted} padding={8} />
 */
export function Spotlight({ target, active, padding = 8, className, children }: SpotlightProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  const updateRect = useCallback(() => {
    const el = document.querySelector(target);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top + window.scrollY,
      left: r.left + window.scrollX,
      width: r.width,
      height: r.height,
    });
  }, [target]);

  useEffect(() => {
    if (!active) return;
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [active, updateRect]);

  if (!active) return null;

  return (
    <Portal>
      <div className={cn("fixed inset-0 z-[9998]", className)} aria-hidden="true">
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ minHeight: document.documentElement.scrollHeight }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - padding}
                  y={rect.top - padding}
                  width={rect.width + padding * 2}
                  height={rect.height + padding * 2}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.5)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>
      {children && rect && (
        <div
          className="absolute z-[9999]"
          style={{
            top: rect.top + rect.height + padding + 8,
            left: rect.left + rect.width / 2,
            transform: "translateX(-50%)",
          }}
        >
          {children}
        </div>
      )}
    </Portal>
  );
}
