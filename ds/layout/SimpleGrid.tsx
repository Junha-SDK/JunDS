"use client";
import { forwardRef } from "react";
import { Box } from "../core/Box";
import type { BoxProps } from "../core/Box";
import type { Responsive, SpacingToken } from "../core/styleProps";

export interface SimpleGridProps extends Omit<BoxProps, "display"> {
  cols?: Responsive<number>;
  gap?: Responsive<SpacingToken>;
  minChildWidth?: number;
}

export const SimpleGrid = forwardRef<HTMLElement, SimpleGridProps>(
  ({ cols = 1, gap = 4, minChildWidth, ...props }, ref) => {
    const resolvedCols = minChildWidth
      ? `repeat(auto-fill, minmax(${minChildWidth}px, 1fr))`
      : cols;

    return <Box ref={ref} display="grid" cols={resolvedCols} gap={gap} {...props} />;
  },
);

SimpleGrid.displayName = "SimpleGrid";
