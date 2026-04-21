"use client";

import React, { useState } from "react";
import { cn } from "../../utils";

/**
 * 콜아웃 컴포넌트
 *
 * - 왼쪽 테두리 액센트 (variant별 색상)
 * - variant별 아이콘
 * - 선택적 접기/펼치기 (타이틀 클릭)
 * - variant별 배경 틴트
 */
export interface CalloutProps {
  variant?: "note" | "warning" | "danger" | "tip" | "info";
  title?: string;
  children: React.ReactNode;
  /** 접기/펼치기 가능 여부 */
  collapsible?: boolean;
  className?: string;
}

const VARIANT_CONFIG: Record<
  NonNullable<CalloutProps["variant"]>,
  { icon: string; border: string; bg: string; text: string }
> = {
  tip: {
    icon: "\u{1F4A1}",
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/5",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  warning: {
    icon: "\u26A0\uFE0F",
    border: "border-l-amber-500",
    bg: "bg-amber-500/5",
    text: "text-amber-700 dark:text-amber-400",
  },
  danger: {
    icon: "\u{1F534}",
    border: "border-l-red-500",
    bg: "bg-red-500/5",
    text: "text-red-700 dark:text-red-400",
  },
  note: {
    icon: "\u{1F4DD}",
    border: "border-l-slate-500",
    bg: "bg-slate-500/5",
    text: "text-slate-700 dark:text-slate-400",
  },
  info: {
    icon: "\u2139\uFE0F",
    border: "border-l-blue-500",
    bg: "bg-blue-500/5",
    text: "text-blue-700 dark:text-blue-400",
  },
};

export function Callout({
  variant = "info",
  title,
  children,
  collapsible = false,
  className,
}: CalloutProps) {
  const [collapsed, setCollapsed] = useState(collapsible);
  const config = VARIANT_CONFIG[variant];

  const toggleCollapse = () => {
    if (collapsible) setCollapsed((prev) => !prev);
  };

  return (
    <aside
      className={cn(
        "relative border-l-4 rounded-r-lg px-4 py-3",
        config.border,
        config.bg,
        className,
      )}
      role="note"
    >
      {/* 헤더 */}
      <div
        className={cn(
          "flex items-center gap-2 font-semibold text-sm",
          config.text,
          collapsible && "cursor-pointer select-none",
        )}
        onClick={toggleCollapse}
        role={collapsible ? "button" : undefined}
        aria-expanded={collapsible ? !collapsed : undefined}
      >
        <span className="text-base leading-none" aria-hidden="true">
          {config.icon}
        </span>
        {title && <span>{title}</span>}
        {collapsible && (
          <span
            className={cn(
              "ml-auto transition-transform duration-200 text-xs",
              collapsed ? "rotate-0" : "rotate-90",
            )}
            aria-hidden="true"
          >
            &#9654;
          </span>
        )}
      </div>

      {/* 내용 */}
      <div
        className={cn(
          "text-sm leading-relaxed mt-1 overflow-hidden transition-all duration-200",
          collapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100",
        )}
      >
        {children}
      </div>
    </aside>
  );
}
