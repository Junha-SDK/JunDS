"use client";
import { forwardRef } from "react";
import { Flex } from "./Flex";
import type { FlexProps } from "./Flex";

export type VStackProps = Omit<FlexProps, "direction">;

export const VStack = forwardRef<HTMLElement, VStackProps>(({ gap = "md", ...props }, ref) => (
  <Flex ref={ref} direction="column" gap={gap} {...props} />
));

VStack.displayName = "VStack";
