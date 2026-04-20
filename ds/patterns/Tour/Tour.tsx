"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";

export interface TourStep {
  target: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export interface TourProps {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
  current?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * 가이드 투어 오버레이
 * @description 단계별로 UI 요소를 하이라이트하며 온보딩 가이드를 제공합니다.
 * @example
 * <Tour
 *   open={showTour}
 *   onClose={() => setShowTour(false)}
 *   steps={[{ target: "#btn", title: "버튼", description: "여기를 클릭하세요" }]}
 * />
 */
export function Tour({ steps, open, onClose, current: controlledCurrent, onStepChange, className }: TourProps) {
  const [internalCurrent, setInternalCurrent] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const current = controlledCurrent ?? internalCurrent;
  const step = steps[current];

  const setCurrent = useCallback(
    (idx: number) => {
      setInternalCurrent(idx);
      onStepChange?.(idx);
    },
    [onStepChange],
  );

  const updateRect = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
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
  }, [step]);

  useEffect(() => {
    if (!open) return;
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open, updateRect]);

  useEffect(() => {
    if (!open) {
      setInternalCurrent(0);
    }
  }, [open]);

  if (!open || !step) return null;

  const padding = 6;
  const placement = step.placement ?? "bottom";

  const popoverStyle = (): React.CSSProperties => {
    if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const gap = 12;
    switch (placement) {
      case "top":
        return { top: rect.top - gap, left: rect.left + rect.width / 2, transform: "translate(-50%, -100%)" };
      case "bottom":
        return { top: rect.top + rect.height + gap, left: rect.left + rect.width / 2, transform: "translateX(-50%)" };
      case "left":
        return { top: rect.top + rect.height / 2, left: rect.left - gap, transform: "translate(-100%, -50%)" };
      case "right":
        return { top: rect.top + rect.height / 2, left: rect.left + rect.width + gap, transform: "translateY(-50%)" };
    }
  };

  return (
    <Portal>
      {/* 오버레이 */}
      <div className="fixed inset-0 z-[9998]" aria-hidden="true">
        <svg className="absolute inset-0 w-full h-full" style={{ minHeight: document.documentElement.scrollHeight }}>
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - padding}
                  y={rect.top - padding}
                  width={rect.width + padding * 2}
                  height={rect.height + padding * 2}
                  rx="6"
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
            mask="url(#tour-mask)"
          />
        </svg>
      </div>

      {/* 팝오버 */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={step.title}
        className={cn(
          "absolute z-[9999] w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4",
          className,
        )}
        style={popoverStyle()}
      >
        <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
        <p className="text-sm text-muted mb-4">{step.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            {current + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            {current > 0 && (
              <button
                type="button"
                onClick={() => setCurrent(current - 1)}
                className="px-3 py-1 text-xs rounded-md border border-gray-200 text-foreground hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
            )}
            {current < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrent(current + 1)}
                className="px-3 py-1 text-xs rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                다음
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 text-xs rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                완료
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs rounded-md text-muted hover:text-foreground transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
