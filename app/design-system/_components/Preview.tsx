"use client";
import { Box } from "@/ds/core";
import { useState, type ReactNode } from "react";
import { cn } from "@/ds/utils/cn";

export function Preview({
  children,
  className,
  padding = true,
  sourceCode,
  language = "tsx",
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  /** 미리보기 옆에 토글 가능한 소스 코드. 비워두면 토글 UI를 표시하지 않습니다. */
  sourceCode?: string;
  language?: string;
}) {
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!sourceCode) return;
    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  if (!sourceCode) {
    return (
      <Box
        border
        radius="xl"
        bg="card"
        transition
        p={padding ? 6 : undefined}
        className={className}
        data-preview=""
      >
        {children}
      </Box>
    );
  }

  return (
    <Box border radius="xl" overflow="hidden" bg="card" transition data-preview="">
      <Box
        position="relative"
        p={padding ? 6 : undefined}
        className={cn("transition-[border-color] duration-200", showSource ? "border-b border-border" : undefined, className)}
      >
        <Box position="absolute" className="top-3 right-3 flex items-center gap-1 z-10">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "코드가 복사되었습니다" : "코드 복사"}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium cursor-pointer border",
              "transition-all duration-200 active:scale-95",
              copied
                ? "bg-success/10 text-success border-success/20"
                : "bg-card/80 text-muted border-border hover:text-primary hover:border-primary/30 backdrop-blur-sm",
            )}
          >
            <span className="relative inline-flex w-[11px] h-[11px]">
              <svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                className={cn(
                  "absolute inset-0 transition-all duration-200",
                  copied ? "opacity-100 scale-100" : "opacity-0 scale-50",
                )}
              >
                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg
                width="11"
                height="11"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
                className={cn(
                  "absolute inset-0 transition-all duration-200",
                  copied ? "opacity-0 scale-50" : "opacity-100 scale-100",
                )}
              >
                <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </span>
            <span>{copied ? "복사됨" : "복사"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSource((s) => !s)}
            aria-expanded={showSource}
            aria-label="소스 코드 보기 토글"
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium cursor-pointer border",
              "transition-all duration-200 active:scale-95",
              showSource
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-card/80 text-muted border-border hover:text-primary hover:border-primary/30 backdrop-blur-sm",
            )}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
              className={cn("transition-transform duration-200", showSource ? "rotate-90" : undefined)}
            >
              <path d="M5 3.5L1.5 7L5 10.5M9 3.5L12.5 7L9 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{showSource ? "닫기" : "코드"}</span>
          </button>
        </Box>
        {children}
      </Box>
      <div className="smooth-expand" data-open={showSource}>
        <div className="smooth-expand__inner">
          <Box className="bg-gray-950">
            <Box className="px-4 py-1.5 border-b border-white/5">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">{language}</span>
            </Box>
            <pre className="p-4 text-xs leading-relaxed overflow-x-auto text-gray-100">
              <code>{sourceCode}</code>
            </pre>
          </Box>
        </div>
      </div>
    </Box>
  );
}
