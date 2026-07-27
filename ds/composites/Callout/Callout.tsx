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
  /**
   * 콜아웃 유형.
   * `warn` 은 `warning` 의 별칭 — 마크다운 문법 `:::warn` 같은 표기를 그대로 받기 위한 것이다.
   */
  variant?: "note" | "warning" | "warn" | "danger" | "tip" | "info" | "success";
  /** 제목 */
  title?: string;
  /** 본문 내용 */
  children: React.ReactNode;
  /** 접기/펼치기 가능 여부 */
  collapsible?: boolean;
  /** 추가 클래스 */
  className?: string;
}

const VARIANT_CONFIG: Record<
  "note" | "warning" | "danger" | "tip" | "info" | "success",
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
  success: {
    icon: "\u2705",
    border: "border-l-green-500",
    bg: "bg-green-500/5",
    text: "text-green-700 dark:text-green-400",
  },
};

/** \uD45C\uAE30 \uD754\uB4E4\uB9BC\uC744 \uC815\uADDC variant \uB85C \uC811\uB294\uB2E4 */
const VARIANT_ALIAS: Record<string, keyof typeof VARIANT_CONFIG> = {
  warn: "warning",
};

/**
 * 강조성 메시지 박스(정보/경고/팁 등)를 표시합니다.
 * @example
 * <Callout variant="info" title="알려드립니다">
 *   본문 내용을 입력하세요.
 * </Callout>
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export function Callout({
  variant = "info",
  title,
  children,
  collapsible = false,
  className,
}: CalloutProps) {
  const [collapsed, setCollapsed] = useState(collapsible);
  const config = VARIANT_CONFIG[VARIANT_ALIAS[variant] ?? (variant as keyof typeof VARIANT_CONFIG)];

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
