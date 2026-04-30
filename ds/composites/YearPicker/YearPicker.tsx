"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface YearPickerProps extends HTMLAttributes<HTMLDivElement> {}

export const YearPicker = forwardRef<HTMLDivElement, YearPickerProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
YearPicker.displayName = "YearPicker";
