"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface SnackbarProps extends HTMLAttributes<HTMLDivElement> {}

export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
Snackbar.displayName = "Snackbar";
