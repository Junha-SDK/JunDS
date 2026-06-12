"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { TextareaHTMLAttributes } from "react";

export interface TextareaAutosizeProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> {
  /** 최소 행 수 */
  minRows?: number;
  /** 최대 행 수 (넘으면 스크롤) */
  maxRows?: number;
  /** 글자 수 표시 (maxLength와 함께) */
  showCount?: boolean;
}

/**
 * 컨텐츠에 맞춰 자동으로 높이가 늘어나는 textarea (chat composer, comment 입력 등).
 * @example
 * <TextareaAutosize minRows={2} maxRows={8} placeholder="메시지 입력" />
 * @status stable
 * @since 2.3.0
 * @tags input
 */
export const TextareaAutosize = forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(function TextareaAutosize(
  { minRows = 2, maxRows = 10, showCount, maxLength, className, value, defaultValue, onChange, style, ...props },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);
  const [length, setLength] = useState(() => String(value ?? defaultValue ?? "").length);

  const resize = () => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const paddingY = parseFloat(getComputedStyle(el).paddingTop) + parseFloat(getComputedStyle(el).paddingBottom);
    const minH = lineHeight * minRows + paddingY;
    const maxH = lineHeight * maxRows + paddingY;
    const next = Math.min(maxH, Math.max(minH, el.scrollHeight));
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxH ? "auto" : "hidden";
  };

  useEffect(() => { resize(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [value]);
  useEffect(() => { resize(); }, []);

  return (
    <div className="relative">
      <textarea
        ref={innerRef}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onInput={resize}
        onChange={(e) => {
          setLength(e.currentTarget.value.length);
          onChange?.(e);
          resize();
        }}
        style={{ resize: "none", ...style }}
        className={cn(
          "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm",
          "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      />
      {showCount && maxLength && (
        <span className="absolute bottom-1 right-2 text-[10px] text-muted tabular-nums">
          {length} / {maxLength}
        </span>
      )}
    </div>
  );
});
