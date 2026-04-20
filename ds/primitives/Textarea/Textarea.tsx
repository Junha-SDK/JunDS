"use client";
import { forwardRef, useEffect, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  autoResize?: boolean;
  showCount?: boolean;
}

/**
 * 텍스트영역 컴포넌트
 * @example
 * <Textarea autoResize placeholder="설명을 입력하세요" maxLength={500} showCount />
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
            "w-full border bg-white px-3 py-2 text-sm rounded-lg transition-all duration-150",
            "placeholder:text-muted-light resize-y min-h-[80px]",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            autoResize && "resize-none overflow-hidden",
            error
              ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,63,63,0.15)]"
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
