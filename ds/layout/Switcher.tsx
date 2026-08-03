"use client";
import { forwardRef, Children } from "react";
import { Box } from "../core/Box";
import type { BoxProps } from "../core/Box";
import { breakpoints, type Breakpoint } from "../tokens/breakpoints";

export interface SwitcherProps extends Omit<BoxProps, "display" | "direction" | "wrap"> {
  /**
   * 접힘 기준 폭 — 브레이크포인트 토큰 또는 px 숫자.
   * 뷰포트가 아니라 **자기가 놓인 컨테이너**가 이보다 좁아지면 세로로 접힌다.
   */
  threshold?: Breakpoint | number;
  /** 한 줄에 허용할 최대 아이템 수 — 넘으면 폭과 무관하게 전부 세로로 쌓는다 */
  limit?: number;
}

/**
 * 좁으면 세로로 접기 — 넓으면 나란히, 좁으면 위아래.
 * 브레이크포인트 미디어쿼리 없이 flex-basis 계산만으로 동작하므로
 * 사이드바·카드 안에 중첩해도 그 자리의 폭을 기준으로 접힌다.
 * (웹 CE `jd-switcher` / iOS `JdSwitcher` 의 React 대응물)
 */
export const Switcher = forwardRef<HTMLElement, SwitcherProps>(
  ({ threshold = "md", limit, gap = "md", align = "stretch", children, ...props }, ref) => {
    const thresholdPx = typeof threshold === "number" ? threshold : breakpoints[threshold];
    const count = Children.count(children);
    const forceColumn = limit !== undefined && count > limit;
    // 컨테이너가 threshold보다 좁으면 (threshold - 100%)이 양수가 되어
    // basis가 폭 전체를 넘고, 넓으면 음수가 되어 한 줄에 나란히 선다.
    const flexBasis = forceColumn ? "100%" : `calc((${thresholdPx}px - 100%) * 999)`;

    return (
      <Box ref={ref} display="flex" wrap="wrap" gap={gap} align={align} {...props}>
        {Children.map(children, (child) =>
          child === null || child === undefined || typeof child === "boolean" ? (
            child
          ) : (
            <div style={{ flexGrow: 1, flexBasis, minWidth: 0 }}>{child}</div>
          ),
        )}
      </Box>
    );
  },
);

Switcher.displayName = "Switcher";
