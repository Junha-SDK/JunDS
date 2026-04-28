"use client";
import { Box } from "../core/Box";
import type { SpacingToken } from "../core/styleProps";

export interface SpacerProps {
  size?: SpacingToken;
  axis?: "vertical" | "horizontal";
  className?: string;
}

/** 수직/수평 간격을 토큰으로 제어 */
export function Spacer({ size = 4, axis = "vertical", className }: SpacerProps) {
  return axis === "vertical" ? (
    <Box py={size} shrink={0} aria-hidden="true" className={className} />
  ) : (
    <Box px={size} shrink={0} aria-hidden="true" className={className} />
  );
}
