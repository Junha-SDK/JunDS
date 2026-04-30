"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface CookieConsentProps extends HTMLAttributes<HTMLDivElement> {}

export const CookieConsent = forwardRef<HTMLDivElement, CookieConsentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
CookieConsent.displayName = "CookieConsent";
