"use client";
import { cn } from "@/ds/utils/cn";
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
    <div
      className={cn(
        "border border-border rounded-xl bg-card transition-colors duration-200",
        padding && "p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
