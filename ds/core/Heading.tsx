"use client";
import { forwardRef } from "react";
import { Box } from "./Box";
import type { BoxProps } from "./Box";
import type { Responsive, FontSizeToken, FontWeightToken } from "./styleProps";

export interface HeadingProps
  extends Omit<BoxProps, "as" | "fontSize" | "fontWeight" | "lineHeight"> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  truncate?: boolean;
}

const levelDefaults: Record<
  number,
  {
    fontSize: Responsive<FontSizeToken>;
    fontWeight: FontWeightToken;
    lineHeight: string;
    mb: number;
  }
> = {
  1: { fontSize: { base: "2xl", md: "3xl" }, fontWeight: "bold", lineHeight: "tight", mb: 6 },
  2: { fontSize: { base: "xl", md: "2xl" }, fontWeight: "bold", lineHeight: "tight", mb: 4 },
  3: { fontSize: "xl", fontWeight: "semibold", lineHeight: "snug", mb: 3 },
  4: { fontSize: "lg", fontWeight: "semibold", lineHeight: "normal", mb: 2 },
  5: { fontSize: "md", fontWeight: "semibold", lineHeight: "normal", mb: 2 },
  6: { fontSize: "sm", fontWeight: "semibold", lineHeight: "normal", mb: 1.5 },
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, truncate, className, ...props }, ref) => {
    const defaults = levelDefaults[level];
    const tag = `h${level}` as const;

    return (
      <Box
        ref={ref as React.Ref<HTMLElement>}
        as={tag}
        fontSize={defaults.fontSize}
        fontWeight={defaults.fontWeight}
        lineHeight={defaults.lineHeight}
        mb={props.mb ?? defaults.mb}
        color={props.color ?? "foreground"}
        letterSpacing={level <= 2 ? "tight" : undefined}
        textTransform={level === 6 ? "uppercase" : undefined}
        className={truncate ? `truncate ${className ?? ""}` : className}
        {...props}
      />
    );
  },
);

Heading.displayName = "Heading";
