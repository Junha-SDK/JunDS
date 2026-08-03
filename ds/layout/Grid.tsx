"use client";
import { forwardRef } from "react";
import { Box } from "../core/Box";
import type { BoxProps } from "../core/Box";
import type { Responsive, SpacingToken } from "../core/styleProps";

export interface GridProps extends Omit<BoxProps, "display"> {
  cols?: Responsive<number | string>;
  rows?: number | string;
  gap?: Responsive<SpacingToken>;
  rowGap?: Responsive<SpacingToken>;
  columnGap?: Responsive<SpacingToken>;
  autoFit?: number;
  autoFill?: number;
}

export const Grid = forwardRef<HTMLElement, GridProps>(
  ({ cols = 1, rows, gap = 4, rowGap, columnGap, autoFit, autoFill, ...props }, ref) => {
    const resolvedCols = autoFit
      ? `repeat(auto-fit, minmax(${autoFit}px, 1fr))`
      : autoFill
      ? `repeat(auto-fill, minmax(${autoFill}px, 1fr))`
      : cols;

    return (
      <Box
        ref={ref}
        display="grid"
        cols={resolvedCols}
        rows={rows}
        gap={gap}
        rowGap={rowGap}
        columnGap={columnGap}
        {...props}
      />
    );
  },
);

Grid.displayName = "Grid";
