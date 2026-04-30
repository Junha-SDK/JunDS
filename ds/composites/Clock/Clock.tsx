"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface ClockProps extends HTMLAttributes<HTMLDivElement> {}

export const Clock = forwardRef<HTMLDivElement, ClockProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
Clock.displayName = "Clock";
