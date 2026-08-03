"use client";
import { cn } from "../../utils/cn";
import { Slot } from "../../utils/Slot";
import type { ReactNode } from "react";

export interface ButtonGroupProps {
  /** 자식 버튼 요소 */
  children: ReactNode;
  /** 버튼 간 구분선 */
  separated?: boolean;
  /** 전체 너비 */
  fullWidth?: boolean;
  /** 추가 클래스 */
  className?: string;
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
}

/**
 * 버튼 그룹
 * @example
 * <ButtonGroup>
 *   <Button variant="secondary">왼쪽</Button>
 *   <Button variant="secondary">중앙</Button>
 *   <Button variant="secondary">오른쪽</Button>
 * </ButtonGroup>
 * @status stable
 * @since 2.2.0
 * @tags form, control
 */
export function ButtonGroup({
  children,
  separated,
  fullWidth,
  className,
  asChild,
}: ButtonGroupProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(
        "inline-flex",
        fullWidth && "w-full",
        separated
          ? "gap-1"
          : "[&>*]:rounded-none [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg [&>*:not(:last-child)]:border-r-0",
        className,
      )}
      role="group"
    >
      {children}
    </Comp>
  );
}
