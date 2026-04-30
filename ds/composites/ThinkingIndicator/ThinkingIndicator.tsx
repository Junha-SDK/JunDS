"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface ThinkingIndicatorProps extends HTMLAttributes<HTMLDivElement> {}

export const ThinkingIndicator = forwardRef<HTMLDivElement, ThinkingIndicatorProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
ThinkingIndicator.displayName = "ThinkingIndicator";
