"use client";
import { Box } from "./Box";
import { Heading } from "./Heading";
import { Text } from "./Text";
import type { ReactNode } from "react";
import type { SpacingToken, Responsive } from "./styleProps";

export interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  p?: Responsive<SpacingToken>;
  gap?: Responsive<SpacingToken>;
  border?: boolean;
  className?: string;
}

export function Section({
  title,
  description,
  children,
  p,
  gap = "md",
  border,
  className,
}: SectionProps) {
  return (
    <Box
      as="section"
      p={p}
      radius={border ? "xl" : undefined}
      border={border || undefined}
      className={className}
    >
      {(title || description) && (
        <Box mb={4}>
          {title && (
            <Heading level={4} mb={description ? 0.5 : 0}>
              {title}
            </Heading>
          )}
          {description && (
            <Text fontSize="sm" dimmed>
              {description}
            </Text>
          )}
        </Box>
      )}
      <Box display="flex" direction="column" gap={gap}>
        {children}
      </Box>
    </Box>
  );
}
