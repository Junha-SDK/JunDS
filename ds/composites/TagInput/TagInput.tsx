"use client";
import { useState, useRef, useCallback, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface TagInputProps {
  /** 태그 배열 */
  value: string[];
  /** 태그 변경 콜백 */
  onChange: (tags: string[]) => void;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 최대 태그 수 */
  maxTags?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 오류 상태 */
  error?: boolean;
  /** 입력 크기 */
  size?: "sm" | "md" | "lg";
  /** 추가 클래스 */
  className?: string;
}

const sizeStyles = {
  sm: "min-h-8 text-xs gap-1 px-2",
  md: "min-h-9 text-sm gap-1.5 px-3",
  lg: "min-h-11 text-base gap-2 px-4",
};

const tagSizeStyles = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-2.5 py-1",
};

/**
 * 태그 입력 컴포넌트
 * @example
 * <TagInput value={["React","Next"]} onChange={setTags} placeholder="태그 입력 후 Enter" />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const TagInput = forwardRef<HTMLDivElement, TagInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "태그 입력 후 Enter",
      maxTags,
      disabled,
      error,
      size = "md",
      className,
    },
    ref,
  ) => {
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = useCallback(
      (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed || value.includes(trimmed)) return;
        if (maxTags && value.length >= maxTags) return;
        onChange([...value, trimmed]);
        setInput("");
      },
      [value, onChange, maxTags],
    );

    const removeTag = useCallback(
      (idx: number) => {
        onChange(value.filter((_, i) => i !== idx));
      },
      [value, onChange],
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && input) {
        e.preventDefault();
        addTag(input);
      } else if (e.key === "Backspace" && !input && value.length > 0) {
        removeTag(value.length - 1);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap items-center border rounded-xl bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] cursor-text",
          // 태그가 늘면 높이가 변하는 컨테이너다 — `all` 이면 그 높이까지 전이돼 흐른다.
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
          error ? "border-danger" : "border-border hover:border-muted-light",
          disabled && "opacity-50 cursor-not-allowed",
          sizeStyles[size],
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className={cn(
              "inline-flex max-w-full items-center gap-1 bg-primary/10 text-primary-ink rounded-lg font-medium shadow-[0_0_0_1px_inset] shadow-primary/15",
              "animate-fade-in-scale motion-reduce:animate-none",
              tagSizeStyles[size],
            )}
          >
            <span className="min-w-0 truncate">{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(i);
                }}
                className={cn(
                  "-mr-0.5 shrink-0 rounded-full p-0.5 cursor-pointer",
                  "transition-colors hover:bg-primary/15 hover:text-danger active:bg-primary/25",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-1 focus-visible:ring-offset-card",
                )}
                aria-label={`${tag} 제거`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M3 3l6 6M9 3l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled || (maxTags !== undefined && value.length >= maxTags)}
          className="flex-1 min-w-[80px] outline-none bg-transparent placeholder:text-muted"
        />
      </div>
    );
  },
);
TagInput.displayName = "TagInput";
