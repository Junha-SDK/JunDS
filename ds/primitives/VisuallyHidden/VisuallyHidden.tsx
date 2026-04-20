import type { HTMLAttributes } from "react";

/**
 * 시각적으로 숨기지만 스크린리더에서 접근 가능
 * @example
 * <VisuallyHidden>테이블 정렬 기준</VisuallyHidden>
 */
export function VisuallyHidden({ children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{ clip: "rect(0,0,0,0)" }}
      {...props}
    >
      {children}
    </span>
  );
}
