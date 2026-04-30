"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
PageHeader.displayName = "PageHeader";
