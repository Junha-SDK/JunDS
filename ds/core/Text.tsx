"use client";
import { forwardRef } from "react";
import { Box } from "./Box";
import type { BoxProps } from "./Box";

export interface TextProps extends Omit<BoxProps, "as"> {
  as?: "p" | "span" | "div" | "label" | "strong" | "em" | "small";
  truncate?: boolean;
  lineClamp?: number;
  mono?: boolean;
  dimmed?: boolean;
}

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ as = "p", truncate, lineClamp, mono, dimmed, className, style, ...props }, ref) => {
    const clampStyle: React.CSSProperties | undefined = lineClamp
      ? {
          display: "-webkit-box",
          WebkitLineClamp: lineClamp,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }
      : undefined;

    return (
      <Box
        ref={ref}
        as={as}
        fontSize={props.fontSize ?? "md"}
        lineHeight={props.lineHeight ?? "relaxed"}
        color={dimmed ? "muted" : props.color}
        className={
          [mono && "font-mono", truncate && "truncate", className].filter(Boolean).join(" ") ||
          undefined
        }
        style={{ ...clampStyle, ...style }}
        {...props}
      />
    );
  },
);

Text.displayName = "Text";
