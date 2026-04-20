"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";

export interface CopyButtonProps {
  text: string;
  /** 복사 후 표시 텍스트 */
  copiedLabel?: string;
  /** 기본 표시 텍스트 */
  label?: string;
  variant?: "icon" | "button";
  size?: "sm" | "md";
  className?: string;
}

/**
 * 클립보드 복사 버튼
 * @example
 * <CopyButton text="복사할 텍스트" />
 * <CopyButton text={code} variant="button" label="코드 복사" />
 */
export function CopyButton({
  text,
  copiedLabel = "복사됨!",
  label = "복사",
  variant = "icon",
  size = "md",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium transition-all duration-150 rounded-lg cursor-pointer",
          "border border-border hover:bg-gray-50",
          copied ? "text-success border-success/30" : "text-foreground",
          size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
          className,
        )}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M10 4V3a1.5 1.5 0 00-1.5-1.5h-5A1.5 1.5 0 002 3v5A1.5 1.5 0 003.5 9.5H4" stroke="currentColor" strokeWidth="1.2" /></svg>
        )}
        {copied ? copiedLabel : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-all cursor-pointer",
        "text-muted hover:text-foreground hover:bg-gray-100",
        size === "sm" ? "w-6 h-6" : "w-7 h-7",
        copied && "text-success",
        className,
      )}
      title={copied ? copiedLabel : label}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M10 4V3a1.5 1.5 0 00-1.5-1.5h-5A1.5 1.5 0 002 3v5A1.5 1.5 0 003.5 9.5H4" stroke="currentColor" strokeWidth="1.2" /></svg>
      )}
    </button>
  );
}
