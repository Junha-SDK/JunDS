"use client";
import { forwardRef, useEffect, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 에러 상태 표시 */
  error?: boolean;
  /** 내용에 맞춰 높이 자동 조절 */
  autoResize?: boolean;
  /** maxLength 기준 글자수 카운터 표시 */
  showCount?: boolean;
}

/**
 * 텍스트영역 컴포넌트
 * @example
 * <Textarea autoResize placeholder="설명을 입력하세요" maxLength={500} showCount />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, autoResize, showCount, maxLength, className, onChange, value, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    useEffect(() => { resize(); }, [value, resize]);

    const setRefs = (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.RefObject<HTMLTextAreaElement | null>).current = el;
    };

    const length = typeof value === "string" ? value.length : 0;

    return (
      <div className="relative">
        <textarea
          ref={setRefs}
          value={value}
          maxLength={maxLength}
          onChange={(e) => {
            onChange?.(e);
            resize();
          }}
          className={cn(
            "w-full border bg-white/80 backdrop-blur-sm px-3.5 py-2.5 text-sm rounded-xl transition-all duration-200 ease-out",
            "placeholder:text-muted-light/60 resize-y min-h-[80px]",
            "focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50",
            autoResize && "resize-none overflow-hidden",
            error
              ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,63,63,0.12),0_1px_2px_rgba(0,0,0,0.04)]"
              : "border-border",
            className,
          )}
          {...props}
        />
        {showCount && maxLength && (
          <span className="absolute bottom-2 right-3 text-xs text-muted-light">
            {length}/{maxLength}
          </span>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
