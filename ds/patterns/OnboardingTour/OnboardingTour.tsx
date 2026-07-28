"use client";
import { forwardRef, useEffect, useState, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface OnboardingStep {
  id: string;
  /** 강조할 요소 selector(string) 또는 lazy-resolve 함수 */
  target: string | (() => HTMLElement | null);
  title: string;
  description?: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}

export interface OnboardingTourProps {
  steps: OnboardingStep[];
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
  className?: string;
}

function resolveTarget(t: OnboardingStep["target"]): HTMLElement | null {
  if (!t) return null;
  if (typeof t === "string") return document.querySelector(t);
  return t();
}

/**
 * 제품 투어 — 첫 사용자 가이드. 스팟라이트 + 말풍선 + 키보드(Esc/←/→/Enter).
 * @example
 * <OnboardingTour open={open} onClose={()=>setOpen(false)}
 *   steps={[{id:"1",target:"#composer",title:"여기서 글을 쓰세요"},…]} />
 * @status stable
 * @since 2.5.0
 * @tags onboarding, overlay
 */
export const OnboardingTour = forwardRef<HTMLDivElement, OnboardingTourProps>(
  function OnboardingTour({ steps, open, onClose, onComplete, className }, ref) {
    const [index, setIndex] = useState(0);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const step = steps[index];

    const update = useCallback(() => {
      if (!step || typeof window === "undefined") return;
      const el = resolveTarget(step.target);
      if (!el) {
        setRect(null);
        return;
      }
      setRect(el.getBoundingClientRect());
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [step]);

    useEffect(() => {
      if (!open) return;
      update();
      const onResize = () => update();
      window.addEventListener("resize", onResize);
      window.addEventListener("scroll", onResize, true);
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onResize, true);
      };
    }, [open, update]);

    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        else if (e.key === "ArrowRight" || e.key === "Enter") {
          e.preventDefault();
          if (index < steps.length - 1) setIndex(index + 1);
          else {
            onComplete?.();
            onClose();
          }
        } else if (e.key === "ArrowLeft" && index > 0) {
          e.preventDefault();
          setIndex(index - 1);
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, index, steps.length, onClose, onComplete]);

    useEffect(() => {
      if (!open) setIndex(0);
    }, [open]);

    if (!open || !step) return null;

    const placement = step.placement ?? "bottom";
    const ttPos = rect
      ? (() => {
          const m = 12;
          if (placement === "bottom") return { top: rect.bottom + m, left: rect.left };
          if (placement === "top") return { top: rect.top - m - 100, left: rect.left };
          if (placement === "left") return { top: rect.top, left: rect.left - 320 - m };
          return { top: rect.top, left: rect.right + m };
        })()
      : { top: 24, left: 24 };

    return (
      <div
        ref={ref}
        className={cn("fixed inset-0 z-[9998]", className)}
        aria-modal="true"
        role="dialog"
        aria-label="제품 투어"
      >
        <div className="absolute inset-0 bg-black/55" onClick={onClose} />
        {rect && (
          <div
            aria-hidden="true"
            // 스팟라이트는 위치·크기가 실제로 움직이는 것이라 그 네 속성만 지목한다 —
            // transition-all 이면 ring/shadow 재계산까지 매 프레임 끌려온다. 움직임이므로 감속 요청을 받는다.
            className="absolute pointer-events-none rounded-xl ring-4 ring-primary/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-[top,left,width,height] duration-200 ease-out motion-reduce:transition-none"
            style={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
          />
        )}

        <div
          ref={tooltipRef}
          className="absolute z-[9999] w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface p-4 shadow-[0_20px_48px_-16px_rgba(0,0,0,0.45),0_6px_16px_-6px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]"
          style={ttPos}
        >
          <div className="text-[11px] uppercase tracking-wider text-muted tabular-nums whitespace-nowrap">
            {index + 1} / {steps.length}
          </div>
          <h3 className="mt-1 text-base font-semibold text-foreground">{step.title}</h3>
          {step.description && <div className="mt-1 text-sm text-muted">{step.description}</div>}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-muted rounded-lg px-2 py-1.5 -mx-2 cursor-pointer transition-colors hover:text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              건너뛰기
            </button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => setIndex(index - 1)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border cursor-pointer transition-[background-color,border-color,transform] hover:bg-surface-soft hover:border-muted-light active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  이전
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (index < steps.length - 1) setIndex(index + 1);
                  else {
                    onComplete?.();
                    onClose();
                  }
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] cursor-pointer transition-[background-color,transform] hover:bg-primary-hover active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {index === steps.length - 1 ? "완료" : "다음"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
OnboardingTour.displayName = "OnboardingTour";
