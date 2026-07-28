"use client";
import { useState, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface CopyButtonProps {
  /** 클립보드에 복사할 텍스트 */
  text: string;
  /** 복사 후 표시 텍스트 */
  copiedLabel?: string;
  /** 기본 표시 텍스트 */
  label?: string;
  /** 버튼 표시 형태 */
  variant?: "icon" | "button";
  /** 버튼 크기 */
  size?: "sm" | "md";
  /** 추가 클래스 */
  className?: string;
}

/**
 * 클립보드 복사 버튼
 * @example
 * <CopyButton text="복사할 텍스트" />
 * <CopyButton text={code} variant="button" label="코드 복사" />
 * @status stable
 * @since 2.2.0
 * @tags form, control
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { text, copiedLabel = "복사됨!", label = "복사", variant = "icon", size = "md", className },
  ref,
) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === "button") {
    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCopy}
        className={cn(
          // transition-all 은 padding·font-size 까지 대상으로 삼는다. 바뀌는 건 색뿐이므로 지목한다.
          "inline-flex items-center gap-1.5 font-medium rounded-xl cursor-pointer",
          "transition-colors duration-150",
          // bg-gray-50 은 라이트 전용 값이라 다크에서 무너진다 — 모드를 따라가는 표면 토큰으로.
          "border border-border bg-card hover:bg-surface-soft",
          "active:scale-[0.97] motion-reduce:active:scale-100 motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          copied ? "text-success border-success/30" : "text-foreground",
          size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
          className,
        )}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7.5l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect
              x="4"
              y="4"
              width="8"
              height="8"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M10 4V3a1.5 1.5 0 00-1.5-1.5h-5A1.5 1.5 0 002 3v5A1.5 1.5 0 003.5 9.5H4"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        )}
        {copied ? copiedLabel : label}
      </button>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center rounded-lg cursor-pointer",
        "transition-colors duration-150",
        // bg-gray-100 은 라이트 전용 값 — 모드를 따라가는 표면 토큰으로 옮긴다.
        "text-muted hover:text-foreground hover:bg-surface-soft",
        "active:scale-[0.94] motion-reduce:active:scale-100 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        size === "sm" ? "w-6 h-6" : "w-7 h-7",
        copied && "text-success",
        className,
      )}
      title={copied ? copiedLabel : label}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 7.5l3 3 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M10 4V3a1.5 1.5 0 00-1.5-1.5h-5A1.5 1.5 0 002 3v5A1.5 1.5 0 003.5 9.5H4"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      )}
    </button>
  );
});

CopyButton.displayName = "CopyButton";
