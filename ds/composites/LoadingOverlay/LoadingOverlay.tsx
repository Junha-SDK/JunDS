"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface LoadingOverlayProps {
  active: boolean;
  children: ReactNode;
  label?: string;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({ active, children, label = "로딩 중...", blur, className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {active && (
        <div className={cn("absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70", blur && "backdrop-blur-sm")} role="status" aria-label={label}>
          <svg className="animate-spin w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {label && <p className="text-sm text-muted mt-2">{label}</p>}
        </div>
      )}
    </div>
  );
}
