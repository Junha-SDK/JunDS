"use client";
import { useState, useEffect, useCallback, useRef, useId } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";

export interface TourStep {
  target: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export interface TourProps {
  /** 투어 단계 정의 */
  steps: TourStep[];
  /** 투어 표시 여부 */
  open: boolean;
  /** 투어 종료 콜백 */
  onClose: () => void;
  /** 현재 단계 인덱스 */
  current?: number;
  /** 단계 변경 콜백 */
  onStepChange?: (step: number) => void;
  /** 추가 클래스 */
  className?: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** 팝오버 안의 작은 버튼 3종이 공유하는 상태 3종 — hover·active·focus-visible */
const btnBase = cn(
  "px-3 py-1 text-xs rounded-lg cursor-pointer transition-colors duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
);
const btnPrimary =
  "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-[0_1px_2px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.18)]";

/**
 * 가이드 투어 오버레이
 * @description 단계별로 UI 요소를 하이라이트하며 온보딩 가이드를 제공합니다.
 * @example
 * <Tour
 *   open={showTour}
 *   onClose={() => setShowTour(false)}
 *   steps={[{ target: "#btn", title: "버튼", description: "여기를 클릭하세요" }]}
 * />
 * @status stable
 * @since 2.2.0
 * @tags overlay, navigation
 */
export function Tour({
  steps,
  open,
  onClose,
  current: controlledCurrent,
  onStepChange,
  className,
}: TourProps) {
  const [internalCurrent, setInternalCurrent] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  // 렌더 중에 document 를 읽으면 서버 렌더에서 터진다 — 측정은 effect 로 미룬다
  const [docHeight, setDocHeight] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  // 마스크 id 가 고정 문자열이면 투어 두 개가 같은 문서에 있을 때 서로의 구멍을 덮어쓴다
  const maskId = `tour-mask-${useId()}`;

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
    setDocHeight(document.documentElement.scrollHeight);
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
        return {
          top: rect.top - gap,
          left: rect.left + rect.width / 2,
          transform: "translate(-50%, -100%)",
        };
      case "bottom":
        return {
          top: rect.top + rect.height + gap,
          left: rect.left + rect.width / 2,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - gap,
          transform: "translate(-100%, -50%)",
        };
      case "right":
        return {
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width + gap,
          transform: "translateY(-50%)",
        };
    }
  };

  return (
    <Portal>
      {/* 오버레이 */}
      <div className="fixed inset-0 z-[9998]" aria-hidden="true">
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ minHeight: docHeight || undefined }}
        >
          <defs>
            <mask id={maskId}>
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
            mask={`url(#${maskId})`}
          />
        </svg>
      </div>

      {/* 팝오버 */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={step.title}
        className={cn(
          "absolute z-[9999] w-72 max-w-[calc(100vw-2rem)] bg-card rounded-2xl border border-border p-4",
          // 오버레이 위에 뜬 카드다 — 한 겹 shadow-xl 로는 마스크 구멍과 같은 평면으로 읽힌다.
          // 등장 애니메이션은 넣지 않는다: 위치를 인라인 transform 이 잡고 있어
          // fade-in-scale 계열 키프레임이 재생 중 그 transform 을 덮어쓰면 팝오버가 튄다.
          "shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_-6px_rgba(0,0,0,0.25)] ring-1 ring-white/10",
          className,
        )}
        style={popoverStyle()}
      >
        <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
        <p className="text-sm text-muted mb-4">{step.description}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted tabular-nums whitespace-nowrap">
            {current + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            {current > 0 && (
              <button
                type="button"
                onClick={() => setCurrent(current - 1)}
                className={cn(
                  btnBase,
                  "border border-border text-foreground hover:bg-muted/10 active:bg-muted/20",
                )}
              >
                이전
              </button>
            )}
            {current < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrent(current + 1)}
                className={cn(btnBase, btnPrimary)}
              >
                다음
              </button>
            ) : (
              <button type="button" onClick={onClose} className={cn(btnBase, btnPrimary)}>
                완료
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={cn(btnBase, "text-muted hover:text-foreground hover:bg-muted/10")}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
