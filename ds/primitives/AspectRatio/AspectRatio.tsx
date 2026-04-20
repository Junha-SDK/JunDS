"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface AspectRatioProps {
  /** 가로:세로 비율 (기본값 16/9) */
  ratio?: number;
  /** 자식 요소 */
  children: React.ReactNode;
  className?: string;
}

/**
 * 종횡비 유지 컨테이너
 * @description 자식 요소가 지정된 종횡비를 유지하도록 합니다.
 * @example
 * <AspectRatio ratio={16 / 9}>
 *   <img src="/photo.jpg" className="object-cover w-full h-full" />
 * </AspectRatio>
 * <AspectRatio ratio={1}>
 *   <div>정사각형</div>
 * </AspectRatio>
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 16 / 9, children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative w-full overflow-hidden", className)}
        style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    );
  },
);

AspectRatio.displayName = "AspectRatio";
