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
  steps: OnboardingStep[];
  onComplete?: (stepId: string) => void;
  onFinish?: () => void;
  title?: string;
  className?: string;
}

export function Onboarding({ steps, onComplete, onFinish, title = "시작하기", className }: OnboardingProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className={cn("rounded-xl border border-border bg-white p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted tabular-nums">{completedCount}/{steps.length}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => !step.completed && onComplete?.(step.id)}
            className={cn(
              "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer",
              step.completed ? "bg-success/5" : "hover:bg-gray-50",
            )}
          >
            <div className={cn(
              "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors",
              step.completed ? "bg-success border-success" : "border-border",
            )}>
              {step.completed && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </div>
            <div>
              <p className={cn("text-sm font-medium", step.completed && "line-through text-muted")}>{step.title}</p>
              {step.description && <p className="text-xs text-muted mt-0.5">{step.description}</p>}
            </div>
          </button>
        ))}
      </div>
      {completedCount === steps.length && onFinish && (
        <button type="button" onClick={onFinish} className="w-full mt-4 h-9 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer">
          완료
        </button>
      )}
    </div>
  );
}
