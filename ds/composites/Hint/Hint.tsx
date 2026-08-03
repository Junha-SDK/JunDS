"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Slot, Slottable } from "../../utils/Slot";
import type { HTMLAttributes, ReactNode } from "react";

export type HintVariant = "info" | "tip" | "warning" | "muted";

export interface HintProps extends HTMLAttributes<HTMLDivElement> {
  /** 변형 */
  variant?: HintVariant;
  /** 좌측 아이콘 */
  icon?: ReactNode;
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
  /** 본문 */
  children: ReactNode;
}

const variantClass: Record<HintVariant, string> = {
  info: "text-info",
  tip: "text-success",
  warning: "text-warning",
  muted: "text-muted",
};

const defaultIcons: Record<HintVariant, ReactNode> = {
  info: "ⓘ",
  tip: "✓",
  warning: "⚠",
  muted: "·",
};

/**
 * 인라인 보조 텍스트 (form 도움말, 미세 안내).
 * Tooltip이 hover 시 노출이라면 Hint는 항상 보임.
 * @example
 * <Hint variant="info">8자 이상 입력해주세요</Hint>
 * @status stable
 * @since 2.3.0
 * @tags feedback
 */
export const Hint = forwardRef<HTMLDivElement, HintProps>(function Hint(
  { variant = "muted", icon, asChild, children, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref as never}
      className={cn(
        "inline-flex items-start gap-1.5 text-xs leading-snug",
        variantClass[variant],
        className,
      )}
      {...props}
    >
      <span className="shrink-0 mt-px" aria-hidden="true">
        {icon ?? defaultIcons[variant]}
      </span>
      {asChild ? <Slottable>{children}</Slottable> : <span>{children}</span>}
    </Comp>
  );
});
