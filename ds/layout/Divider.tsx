"use client";
import { Box } from "../core/Box";
import type { SpacingToken, ColorToken } from "../core/styleProps";

export interface LayoutDividerProps {
  orientation?: "horizontal" | "vertical";
  spacing?: SpacingToken;
  color?: ColorToken;
  label?: string;
  className?: string;
}

export function LayoutDivider({ orientation = "horizontal", spacing = 4, color = "border", label, className }: LayoutDividerProps) {
  if (label) {
    return (
      <Box display="flex" align="center" gap="sm" my={orientation === "horizontal" ? spacing : undefined} mx={orientation === "vertical" ? spacing : undefined} className={className}>
        <Box grow={1} h={1} bg={color} />
        <Box as="span" fontSize="xs" color="muted" fontWeight="medium" shrink={0}>{label}</Box>
        <Box grow={1} h={1} bg={color} />
      </Box>
    );
  }

  return orientation === "horizontal" ? (
    <Box h={1} bg={color} my={spacing} className={className} />
  ) : (
    <Box w={1} bg={color} mx={spacing} style={{ alignSelf: "stretch" }} className={className} />
  );
}
