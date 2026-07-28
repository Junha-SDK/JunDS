"use client";
import { forwardRef } from "react";
import { Box } from "../core/Box";
import type { BoxProps } from "../core/Box";
import type { Responsive, SpacingToken } from "../core/styleProps";
import type { ReactNode } from "react";

export interface StackProps extends Omit<BoxProps, "display" | "direction"> {
  direction?: Responsive<"row" | "column" | "row-reverse" | "column-reverse">;
  gap?: Responsive<SpacingToken>;
  divider?: ReactNode;
}

export const Stack = forwardRef<HTMLElement, StackProps>(
  ({ direction = "column", gap = "md", divider, children, ...props }, ref) => {
    if (divider) {
      const items = Array.isArray(children) ? children.filter(Boolean) : [children];
      return (
        <Box ref={ref} display="flex" direction={direction} gap={gap} {...props}>
          {items.map((child, i) => (
            <Box key={i} display="contents">
              {i > 0 && divider}
              {child}
            </Box>
          ))}
        </Box>
      );
    }

    return (
      <Box ref={ref} display="flex" direction={direction} gap={gap} {...props}>
        {children}
      </Box>
    );
  },
);

Stack.displayName = "Stack";

export const HStack = forwardRef<HTMLElement, Omit<StackProps, "direction">>(
  ({ gap = "sm", align = "center", ...props }, ref) => (
    <Stack ref={ref} direction="row" gap={gap} align={align} {...props} />
  ),
);
HStack.displayName = "HStack";

export const VStack = forwardRef<HTMLElement, Omit<StackProps, "direction">>(
  ({ gap = "md", ...props }, ref) => <Stack ref={ref} direction="column" gap={gap} {...props} />,
);
VStack.displayName = "VStack";
