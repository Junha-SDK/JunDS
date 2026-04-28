"use client";
import { forwardRef } from "react";
import { Box } from "../core/Box";
import type { BoxProps } from "../core/Box";
import type { Responsive, SpacingToken } from "../core/styleProps";

export interface ContainerProps extends Omit<BoxProps, "maxW" | "mx"> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  px?: Responsive<SpacingToken>;
  center?: boolean;
}

const sizeMap = {
  xs: "512px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  full: "100%",
};

export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ size = "lg", px = { base: 4, sm: 6 }, center = true, ...props }, ref) => (
    <Box
      ref={ref}
      w="full"
      maxW={sizeMap[size]}
      px={px}
      style={{ marginLeft: center ? "auto" : undefined, marginRight: center ? "auto" : undefined, ...props.style }}
      {...props}
    />
  ),
);

Container.displayName = "Container";
