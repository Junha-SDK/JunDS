"use client";
import { forwardRef } from "react";
import { Box } from "../core/Box";
import type { BoxProps } from "../core/Box";
import type { Responsive, SpacingToken } from "../core/styleProps";

export interface WrapProps extends Omit<BoxProps, "display" | "wrap"> {
  gap?: Responsive<SpacingToken>;
  justify?: "start" | "center" | "end" | "between";
}

export const Wrap = forwardRef<HTMLElement, WrapProps>(
  ({ gap = "sm", justify, align = "center", ...props }, ref) => (
    <Box ref={ref} display="flex" wrap="wrap" gap={gap} justify={justify} align={align} {...props} />
  ),
);

Wrap.displayName = "Wrap";
