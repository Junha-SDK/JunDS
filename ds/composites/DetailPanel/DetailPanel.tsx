"use client";
import { useState, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface DetailPanelTab {
  key: string;
  label: string;
  content: ReactNode;
  badge?: number;
}

export interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  status?: "success" | "warning" | "danger" | "info";
  tabs?: DetailPanelTab[];
  children?: ReactNode;
  width?: number;
  className?: string;
}

const statusStyles: Record<NonNullable<DetailPanelProps["status"]>, { bg: string; text: string; label: string }> = {
  success: { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", label: "성공" },
  warning: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", label: "경고" },
  danger: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", label: "위험" },
  info: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", label: "정보" },
};

/**
 * 디테일 패널
 * 오른쪽에서 슬라이드되는 상세 정보 패널입니다.
 * @example
 * <DetailPanel
 *   open={isOpen}
 *   onClose={close}
 *   title="주문 상세"
 *   subtitle="주문번호 #12345"
 *   status="success"
 *   tabs={[
 *     { key: "info", label: "정보", content: <InfoContent /> },
 *     { key: "history", label: "이력", content: <HistoryContent />, badge: 3 },
 *   ]}
 * />
 */
export function DetailPanel({
  open,
  onClose,
  title,
  subtitle,
  status,
  tabs,
  children,
  width = 420,
  className,
}: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // 탭이 있고 activeTab이 없으면 첫 번째 탭 선택
  useEffect(() => {
    if (tabs && tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0].key);
    }
  }, [tabs, activeTab]);

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, handleEsc]);

  const activeTabContent = tabs?.find((t) => t.key === activeTab)?.content;

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full z-40 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        open ? "translate-x-0" : "translate-x-full",
        className,
      )}
      style={{ width }}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h3>
            {status && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
                  statusStyles[status].bg,
                  statusStyles[status].text,
                )}
              >
                {statusStyles[status].label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer shrink-0 ml-2"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 탭 */}
      {tabs && tabs.length > 0 && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-5 gap-0 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all duration-150 cursor-pointer",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300",
              )}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full min-w-[18px] h-[18px] px-1 text-[10px] font-semibold",
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-5">
        {tabs && activeTabContent ? activeTabContent : children}
      </div>
    </div>
  );
}
