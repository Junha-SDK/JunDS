"use client";
import { Box } from "@/ds/core";
import type { ReactNode } from "react";

export function Preview({
  children,
  className,
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <Box
      border
      radius="xl"
      bg="card"
      transition
      p={padding ? 6 : undefined}
      className={className}
    >
      {children}
    </Box>
  );
}
