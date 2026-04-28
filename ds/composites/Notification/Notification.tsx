"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface NotificationProps {
  title: string;
  description?: string;
  variant?: "info" | "success" | "warning" | "danger";
  icon?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantStyles = {
  info: "border-info/30 bg-info/5",
  success: "border-success/30 bg-success/5",
  warning: "border-warning/30 bg-warning/5",
  danger: "border-danger/30 bg-danger/5",
};

const iconColors = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function Notification({
  title, description, variant = "info", icon, action, onClose, className,
}: NotificationProps) {
  return (
    <div className={cn("flex gap-3 p-4 rounded-xl border", variantStyles[variant], className)} role="alert">
      {icon && <div className={cn("shrink-0 mt-0.5", iconColors[variant])}>{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 p-1 text-muted hover:text-foreground transition-colors cursor-pointer" aria-label="닫기">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      )}
    </div>
  );
}
