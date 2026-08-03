"use client";
import { cn } from "../../utils/cn";
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
export function ButtonGroup({ children, separated, fullWidth, className }: ButtonGroupProps) {
  return (
    <div
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
    </div>
  );
}
