"use client";
import { Box } from "../core/Box";
import type { BoxProps } from "../core/Box";
import type { ReactNode } from "react";

export interface AspectRatioBoxProps extends Omit<BoxProps, "position"> {
  ratio?: number;
  children: ReactNode;
}

export function AspectRatioBox({ ratio = 16 / 9, children, ...props }: AspectRatioBoxProps) {
  return (
    <Box position="relative" overflow="hidden" {...props} style={{ ...props.style, aspectRatio: ratio }}>
      {children}
    </Box>
  );
}
