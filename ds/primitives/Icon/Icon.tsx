"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface IconProps extends HTMLAttributes<HTMLDivElement> {}

export const Icon = forwardRef<HTMLDivElement, IconProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
Icon.displayName = "Icon";
