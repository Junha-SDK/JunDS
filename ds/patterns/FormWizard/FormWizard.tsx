"use client";
import { useState, useCallback, createContext, useContext } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

interface WizardContextType {
  current: number;
  total: number;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  data: Record<string, unknown>;
  setData: (key: string, value: unknown) => void;
  isFirst: boolean;
  isLast: boolean;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within FormWizard");
  return ctx;
}

export interface FormWizardStep {
  title: string;
  description?: string;
  content: ReactNode;
  validate?: (data: Record<string, unknown>) => boolean | string;
}

export interface FormWizardProps {
  /** 위저드 단계 목록 */
  steps: FormWizardStep[];
  /** 완료 콜백 */
  onComplete?: (data: Record<string, unknown>) => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 단계별 폼 마법사(스텝 폼).
 * @example
 * <FormWizard steps={steps} onComplete={(values) => submit(values)} />
 * @status stable
 * @since 2.2.0
 * @tags form, navigation
 */
export function FormWizard({ steps, onComplete, className }: FormWizardProps) {
  const [current, setCurrent] = useState(0);
  const [data, setAllData] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  if (!steps || steps.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[JunDS] FormWizard: `steps`가 비어 있습니다.");
    }
    return null;
  }
  const safeIndex = Math.min(Math.max(current, 0), steps.length - 1);
  const activeStep = steps[safeIndex];

  const setData = useCallback((key: string, value: unknown) => {
    setAllData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const next = useCallback(() => {
    const step = steps[current];
    if (!step) return;
    if (step.validate) {
      const result = step.validate(data);
      if (result !== true) {
        setError(typeof result === "string" ? result : "입력을 확인해주세요");
        return;
      }
    }
    setError(null);
    if (current < steps.length - 1) setCurrent(current + 1);
    else onComplete?.(data);
  }, [current, steps, data, onComplete]);

  const prev = useCallback(() => {
    setError(null);
    setCurrent((s) => Math.max(0, s - 1));
  }, []);

  const goTo = useCallback(
    (step: number) => {
      setError(null);
      setCurrent(Math.max(0, Math.min(step, steps.length - 1)));
    },
    [steps.length],
  );

  const ctx: WizardContextType = {
    current,
    total: steps.length,
    next,
    prev,
    goTo,
    data,
    setData,
    isFirst: current === 0,
    isLast: current === steps.length - 1,
  };

  return (
    <WizardContext.Provider value={ctx}>
      <div className={cn("w-full", className)}>
        {/* Stepper */}
        <div className="flex items-center gap-1 mb-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <button
                type="button"
                onClick={() => i < current && goTo(i)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold tabular-nums transition-colors duration-150 shrink-0",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  i < current && "bg-success text-white cursor-pointer",
                  i === current &&
                    "bg-primary text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)]",
                  // gray-200 은 다크에서 무너진다 — border 토큰이 두 모드 모두에서 "아직 안 온 단계"로 읽힌다
                  i > current && "bg-border text-muted",
                )}
              >
                {i < current ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7l3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </button>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 rounded-full transition-colors duration-150",
                    i < current ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{activeStep.title}</h3>
          {activeStep.description && (
            <p className="text-sm text-muted mt-0.5">{activeStep.description}</p>
          )}
        </div>

        {/* Content */}
        <div className="mb-6">{activeStep.content}</div>

        {/* Error */}
        {error && <p className="text-sm text-danger mb-4">{error}</p>}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={current === 0}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-xl border border-border bg-card transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "hover:bg-muted/10 disabled:opacity-30 disabled:cursor-not-allowed",
            )}
          >
            이전
          </button>
          <span className="text-xs text-muted tabular-nums whitespace-nowrap">
            {current + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={next}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-primary-hover transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {current === steps.length - 1 ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </WizardContext.Provider>
  );
}
