"use client";
import { forwardRef } from "react";
import { Box } from "./Box";
import type { BoxProps } from "./Box";

export interface GridLayoutProps extends Omit<BoxProps, "display"> {
  cols?: number | string;
  rows?: number | string;
}

export const GridLayout = forwardRef<HTMLElement, GridLayoutProps>(
  ({ cols = 1, rows, gap = "md", ...props }, ref) => (
    <Box ref={ref} display="grid" cols={cols} rows={rows} gap={gap} {...props} />
  ),
);

GridLayout.displayName = "GridLayout";
