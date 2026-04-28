"use client";
import { forwardRef } from "react";
import { Box } from "./Box";
import type { BoxProps } from "./Box";

export type CenterProps = Omit<BoxProps, "display" | "align" | "justify">;

export const Center = forwardRef<HTMLElement, CenterProps>(
  (props, ref) => (
    <Box ref={ref} display="flex" align="center" justify="center" {...props} />
  ),
);

Center.displayName = "Center";
