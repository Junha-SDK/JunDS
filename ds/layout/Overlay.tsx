"use client";
import { Box } from "../core/Box";
import type { BoxProps } from "../core/Box";
import type { ReactNode } from "react";

export interface OverlayProps extends Omit<BoxProps, "position"> {
  children: ReactNode;
  center?: boolean;
  blur?: boolean;
}

export function Overlay({ children, center = true, blur, ...props }: OverlayProps) {
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      display={center ? "flex" : undefined}
      align={center ? "center" : undefined}
      justify={center ? "center" : undefined}
      style={{
        ...(blur ? { backdropFilter: "blur(4px)" } : {}),
        ...props.style,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
