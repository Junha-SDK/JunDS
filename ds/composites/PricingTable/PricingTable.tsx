"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface PricingTableProps extends HTMLAttributes<HTMLDivElement> {}

export const PricingTable = forwardRef<HTMLDivElement, PricingTableProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
PricingTable.displayName = "PricingTable";
