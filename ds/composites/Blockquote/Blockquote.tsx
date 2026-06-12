"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type BlockquoteVariant = "default" | "bordered" | "filled" | "callout";

export interface BlockquoteProps extends HTMLAttributes<HTMLQuoteElement> {
  /** 변형 */
  variant?: BlockquoteVariant;
  /** 인용 출처 (예: "— 알베르트 아인슈타인") */
  cite?: ReactNode;
  /** 인용 본문 */
  children: ReactNode;
}

const variantClass: Record<BlockquoteVariant, string> = {
  default: "border-l-4 border-border pl-4",
  bordered: "border-l-4 border-primary pl-4",
  filled: "bg-surface-soft rounded-md p-4 border-l-4 border-primary",
  callout: "bg-primary-soft text-primary rounded-md p-4",
};

/**
 * 인용문 블록.
 * @example
 * <Blockquote cite="아인슈타인">상상력은 지식보다 중요하다.</Blockquote>
 * @status stable
 * @since 2.3.0
 * @tags data-display
 */
export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(function Blockquote(
  { variant = "default", cite, children, className, ...props },
  ref,
) {
  return (
    <blockquote
      ref={ref}
      className={cn("text-base leading-relaxed", variantClass[variant], className)}
      {...props}
    >
      <div className="italic">{children}</div>
      {cite && <footer className="mt-2 text-sm not-italic text-muted">{cite}</footer>}
    </blockquote>
  );
});
