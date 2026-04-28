"use client";
import { useState, forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface BannerProps {
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  dismissible?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const variantStyles = {
  info: "bg-info text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
};

/**
 * 배너 알림 컴포넌트
 * @example
 * <Banner variant="info" dismissible>중요한 공지사항입니다.</Banner>
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(
  ({ children, variant = "info", dismissible = true, icon, action, className }, ref) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium", variantStyles[variant], className)} role="banner">
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="text-center">{children}</span>
      {action && <span className="shrink-0">{action}</span>}
      {dismissible && (
        <button type="button" onClick={() => setVisible(false)} className="shrink-0 ml-2 p-1 hover:bg-white/20 rounded transition-colors cursor-pointer" aria-label="배너 닫기">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      )}
    </div>
  );
},
);
Banner.displayName = "Banner";
