"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface StepItem {
  key: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export interface StepperProps {
  steps: StepItem[];
  current: number;
  direction?: "horizontal" | "vertical";
  className?: string;
}

/**
 * 스텝퍼 — 단계별 진행 표시 컴포넌트
 * @example
 * <Stepper steps={[{key:"1",title:"정보 입력"},{key:"2",title:"확인"},{key:"3",title:"완료"}]} current={1} />
 */
export function Stepper({ steps, current, direction = "horizontal", className }: StepperProps) {
  const isVertical = direction === "vertical";

  return (
    <div
      className={cn(
        "flex",
        isVertical ? "flex-col gap-0" : "items-center gap-0",
        className,
      )}
    >
      {steps.map((step, i) => {
        const status = i < current ? "completed" : i === current ? "current" : "upcoming";
        const isLast = i === steps.length - 1;

        return (
          <div
            key={step.key}
            className={cn(
              "flex",
              isVertical ? "flex-row gap-3" : "flex-col items-center flex-1",
            )}
          >
            {/* 동그라미 + 연결선 */}
            <div className={cn("flex items-center", isVertical ? "flex-col" : "w-full")}>
              {/* 스텝 원 */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors",
                  status === "completed" && "bg-primary text-white",
                  status === "current" && "bg-primary text-white ring-4 ring-primary-light",
                  status === "upcoming" && "bg-gray-200 text-muted",
                )}
              >
                {step.icon ? (
                  step.icon
                ) : status === "completed" ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {/* 연결선 */}
              {!isLast && (
                <div
                  className={cn(
                    isVertical ? "w-px flex-1 min-h-[24px] mx-auto mt-1 mb-1" : "flex-1 h-px mx-2",
                    i < current ? "bg-primary" : "bg-gray-200",
                  )}
                />
              )}
            </div>
            {/* 텍스트 */}
            <div className={cn(isVertical ? "pb-6 pt-0.5" : "mt-2 text-center")}>
              <div
                className={cn(
                  "text-sm font-medium",
                  status === "upcoming" ? "text-muted" : "text-foreground",
                )}
              >
                {step.title}
              </div>
              {step.description && (
                <div className="text-xs text-muted mt-0.5">{step.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
