"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface Tab<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  badge?: number;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "underline" | "pills" | "segment";
  size?: "sm" | "md";
  className?: string;
}

/**
 * 탭 컴포넌트
 * @example
 * <Tabs tabs={[{value:"all",label:"전체"},{value:"mine",label:"내 업무"}]} value={tab} onChange={setTab} />
 */
export function Tabs<T extends string = string>({
  tabs,
  value,
  onChange,
  variant = "underline",
  size = "md",
  className,
}: TabsProps<T>) {
  if (variant === "segment") {
    return (
      <div className={cn("inline-flex bg-gray-100 rounded-lg p-0.5 gap-0.5", className)} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={value === tab.value}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 font-medium transition-all duration-150 rounded-md cursor-pointer active:scale-95",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              value === tab.value
                ? "bg-white text-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                "rounded-full px-1.5 text-[10px] font-semibold",
                value === tab.value ? "bg-primary text-white" : "bg-gray-200 text-muted",
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div className={cn("inline-flex gap-1", className)} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={value === tab.value}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-150 cursor-pointer active:scale-95",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              value === tab.value
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-gray-100 hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                "rounded-full px-1.5 text-[10px] font-semibold",
                value === tab.value ? "bg-white/20 text-white" : "bg-gray-200 text-muted",
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // underline (default)
  return (
    <div className={cn("flex border-b border-border gap-0", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          disabled={tab.disabled}
          onClick={() => onChange(tab.value)}
          className={cn(
            "inline-flex items-center gap-1.5 font-medium transition-all duration-150 border-b-2 -mb-px cursor-pointer active:scale-95",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm",
            value === tab.value
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-primary hover:border-gray-300",
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && (
            <span className={cn(
              "rounded-full px-1.5 text-[10px] font-semibold",
              value === tab.value ? "bg-primary-light text-primary" : "bg-gray-100 text-muted",
            )}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
