"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export type ScrollOrientation = "vertical" | "horizontal" | "both";

export interface ScrollAreaProps {
  /** 자식 요소 */
  children: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
  /** 최대 높이 */
  maxHeight?: string | number;
  /** 스크롤 방향 */
  orientation?: ScrollOrientation;
}

const overflowMap: Record<ScrollOrientation, string> = {
  vertical: "overflow-x-hidden overflow-y-auto",
  horizontal: "overflow-x-auto overflow-y-hidden",
  both: "overflow-auto",
};

/**
 * 커스텀 스크롤 영역
 * @description 사용자 정의 스크롤바가 적용된 스크롤 컨테이너입니다.
 * @example
 * <ScrollArea maxHeight={300}>
 *   <p>긴 내용...</p>
 * </ScrollArea>
 * <ScrollArea orientation="horizontal" maxHeight="200px">
 *   <div className="flex gap-4">...</div>
 * </ScrollArea>
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className, maxHeight, orientation = "vertical" }, ref) => {
    const maxHeightStyle = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

    return (
      <div
        ref={ref}
        role="region"
        aria-label="스크롤 영역"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region must be keyboard-focusable so PageUp/PageDown/arrows scroll it (WAI-ARIA scrollable region pattern)
        tabIndex={0}
        className={cn(
          "relative",
          overflowMap[orientation],
          /* 커스텀 스크롤바 — gray-300/400 은 라이트 전용이라 다크에서 배경에 묻힌다.
             테마를 따라가는 muted 계열로 옮긴다 */
          "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-light/50",
          "[&::-webkit-scrollbar-thumb:hover]:bg-muted/60",
          /* Firefox 는 ::-webkit-* 를 모른다 — 표준 속성으로 같은 모양을 준다
             (`scrollbar-thin` 류는 tailwind-scrollbar 플러그인 전용인데 이 저장소엔 없다) */
          "[scrollbar-width:thin] [scrollbar-color:var(--muted-light)_transparent]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        style={{ maxHeight: maxHeightStyle }}
      >
        {children}
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";
