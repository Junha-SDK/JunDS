"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface AnnouncementBarProps extends HTMLAttributes<HTMLDivElement> {}

export const AnnouncementBar = forwardRef<HTMLDivElement, AnnouncementBarProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
AnnouncementBar.displayName = "AnnouncementBar";
