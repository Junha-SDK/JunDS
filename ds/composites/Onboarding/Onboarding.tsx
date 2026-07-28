"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
}

export interface OnboardingProps {
  /** 단계 목록 */
  steps: OnboardingStep[];
  /** 단계 완료 콜백 */
  onComplete?: (stepId: string) => void;
  /** 모든 단계 완료 후 호출 */
  onFinish?: () => void;
  /** 카드 제목 */
  title?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 단계별 튜토리얼/온보딩 플로우.
 * @example
 * <Onboarding steps={steps} onComplete={() => router.push("/home")} />
 * @status stable
 * @since 2.2.0
 * @tags overlay, navigation
 */
export function Onboarding({
  steps,
  onComplete,
  onFinish,
  title = "시작하기",
  className,
}: OnboardingProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div
      className={cn(
        // 면이 있는 카드는 얕은 그림자 + 상단 인셋 하이라이트로 세운다
        "rounded-xl border border-border bg-card p-5",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted tabular-nums">
          {completedCount}/{steps.length}
        </span>
      </div>
      <div className="h-1.5 bg-border-light rounded-full mb-4 overflow-hidden">
        <div
          // 자라는 것은 폭 하나다 — 그것만 지목해야 색·그림자까지 덩달아 흐르지 않는다
          className="h-full bg-primary rounded-full transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => !step.completed && onComplete?.(step.id)}
            className={cn(
              "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
              step.completed ? "bg-success/5" : "hover:bg-card-hover active:bg-border-light",
            )}
          >
            <div
              className={cn(
                "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors",
                step.completed ? "bg-success border-success" : "border-border",
              )}
            >
              {step.completed && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2.5 2.5L8 3"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className={cn("text-sm font-medium", step.completed && "line-through text-muted")}>
                {step.title}
              </p>
              {step.description && <p className="text-xs text-muted mt-0.5">{step.description}</p>}
            </div>
          </button>
        ))}
      </div>
      {completedCount === steps.length && onFinish && (
        <button
          type="button"
          onClick={onFinish}
          className="w-full mt-4 h-9 bg-primary text-white text-sm font-medium rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-primary-hover active:scale-[0.98] transition-[background-color,transform] duration-150 motion-reduce:transition-none motion-reduce:active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          완료
        </button>
      )}
    </div>
  );
}
