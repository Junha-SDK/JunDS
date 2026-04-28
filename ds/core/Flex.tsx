"use client";
import { forwardRef } from "react";
import { Box } from "./Box";
import type { BoxProps } from "./Box";
import type { SpacingToken } from "./styleProps";

export interface FlexProps extends Omit<BoxProps, "display"> {
  inline?: boolean;
}

export const Flex = forwardRef<HTMLElement, FlexProps>(
  ({ inline, direction = "row", ...props }, ref) => (
    <Box
      ref={ref}
      display={inline ? "inline-flex" : "flex"}
      direction={direction}
      {...props}
    />
  ),
);

Flex.displayName = "Flex";
