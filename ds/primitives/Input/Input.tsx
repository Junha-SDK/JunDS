"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 크기 */
  inputSize?: InputSize;
  /** 에러 상태 */
  error?: boolean;
  /** 왼쪽 아이콘/요소 */
  leftSlot?: React.ReactNode;
  /** 오른쪽 아이콘/요소 */
  rightSlot?: React.ReactNode;
}

const sizeStyles: Record<InputSize, string> = {
  sm: "h-8 px-2.5 text-xs rounded-md",
  md: "h-9 px-3 text-sm rounded-lg",
  lg: "h-11 px-4 text-base rounded-xl",
};

/**
 * 텍스트 입력 컴포넌트
 * @example
 * <Input placeholder="이름" />
 * <Input error leftSlot={<SearchIcon />} />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = "md", error, leftSlot, rightSlot, className, ...props }, ref) => {
    if (leftSlot || rightSlot) {
      return (
        <div
          className={cn(
            "relative flex items-center",
            error && "text-danger",
          )}
        >
          {leftSlot && (
            <span className="absolute left-3 text-muted pointer-events-none">{leftSlot}</span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full border bg-white transition-all duration-150",
              "placeholder:text-muted-light",
              "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,63,63,0.15)]"
                : "border-border",
              sizeStyles[inputSize],
              leftSlot && "pl-9",
              rightSlot && "pr-9",
              className,
            )}
            {...props}
          />
          {rightSlot && (
            <span className="absolute right-3 text-muted">{rightSlot}</span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          "w-full border bg-white transition-all duration-150",
          "placeholder:text-muted-light",
          "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,63,63,0.15)]"
            : "border-border",
          sizeStyles[inputSize],
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
