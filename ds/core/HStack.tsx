"use client";
import { forwardRef } from "react";
import { Flex } from "./Flex";
import type { FlexProps } from "./Flex";

export type HStackProps = Omit<FlexProps, "direction">;

export const HStack = forwardRef<HTMLElement, HStackProps>(
  ({ gap = "sm", align = "center", ...props }, ref) => (
    <Flex ref={ref} direction="row" gap={gap} align={align} {...props} />
  ),
);

HStack.displayName = "HStack";
