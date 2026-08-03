"use client";
import { forwardRef, useMemo } from "react";
import { cn } from "../../utils/cn";

export interface HighlightProps {
  /** 본문 텍스트 */
  text: string;
  /** 강조할 검색어 (대소문자 무시) */
  query: string;
  /** 강조 스타일 */
  variant?: "yellow" | "primary" | "underline";
  /** 추가 클래스 */
  className?: string;
}

const variantClass: Record<NonNullable<HighlightProps["variant"]>, string> = {
  yellow: "bg-yellow-200 dark:bg-yellow-500/30 text-foreground rounded-sm px-0.5",
  primary: "bg-primary/15 text-primary-ink rounded-sm px-0.5 font-semibold",
  underline: "underline decoration-2 decoration-primary underline-offset-2",
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 검색어를 강조해 표시. SearchBar/CommandPalette 결과 강조에 사용.
 * @example
 * <Highlight text="JunDS 디자인 시스템" query="디자인" variant="primary" />
 * @status stable
 * @since 2.5.0
 * @tags content
 */
export const Highlight = forwardRef<HTMLSpanElement, HighlightProps>(
  ({ text, query, variant = "yellow", className }, ref) => {
    const parts = useMemo(() => {
      if (!query) return [{ text, match: false }];
      const re = new RegExp(`(${escapeRegExp(query)})`, "ig");
      return text.split(re).map((p) => ({
        text: p,
        match:
          re.test(p) && p.toLowerCase() === query.toLowerCase()
            ? true
            : p.toLowerCase() === query.toLowerCase(),
      }));
    }, [text, query]);
    return (
      <span ref={ref} className={className}>
        {parts.map((p, i) =>
          p.match ? (
            <mark key={i} className={cn(variantClass[variant])}>
              {p.text}
            </mark>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </span>
    );
  },
);
Highlight.displayName = "Highlight";
