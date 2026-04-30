"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface CountdownProps extends HTMLAttributes<HTMLDivElement> {}

export const Countdown = forwardRef<HTMLDivElement, CountdownProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
Countdown.displayName = "Countdown";
