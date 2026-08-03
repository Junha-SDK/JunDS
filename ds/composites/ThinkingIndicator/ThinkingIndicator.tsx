"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type ThinkingVariant = "dots" | "pulse" | "wave" | "typewriter";

export interface ThinkingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** 애니메이션 종류 */
  variant?: ThinkingVariant;
  /** 좌측 라벨 (예: "Claude가 생각 중") */
  label?: ReactNode;
  /** 점 색상 */
  color?: string;
}

/**
 * AI/LLM 응답 대기 인디케이터. ChatBubble 안에 넣어 사용.
 * @example
 * <ThinkingIndicator label="Claude가 생각 중" />
 * @status stable
 * @since 2.3.0
 * @tags feedback
 */
export const ThinkingIndicator = forwardRef<HTMLDivElement, ThinkingIndicatorProps>(
  function ThinkingIndicator({ variant = "dots", label, color, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={typeof label === "string" ? label : "응답을 생성 중입니다"}
        className={cn("inline-flex items-center gap-2 text-sm text-muted", className)}
        {...props}
      >
        {label && <span>{label}</span>}
        {variant === "dots" && (
          <span className="inline-flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: color ?? "currentColor",
                  animation: `junds-think-bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                }}
              />
            ))}
          </span>
        )}
        {variant === "pulse" && (
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: color ?? "currentColor",
              animation: "junds-think-pulse 1.4s ease-in-out infinite",
            }}
          />
        )}
        {variant === "wave" && (
          <span className="inline-flex items-end gap-0.5 h-3">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-0.5 rounded-full"
                style={{
                  background: color ?? "currentColor",
                  animation: `junds-think-wave 1s ease-in-out ${i * 0.1}s infinite`,
                  height: "100%",
                }}
              />
            ))}
          </span>
        )}
        {variant === "typewriter" && (
          <span
            className="w-0.5 h-3.5 rounded-sm align-middle"
            style={{
              background: color ?? "currentColor",
              animation: "junds-think-blink 1s steps(2) infinite",
            }}
          />
        )}
        <style>{`
        @keyframes junds-think-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes junds-think-pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes junds-think-wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        @keyframes junds-think-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      </div>
    );
  },
);
