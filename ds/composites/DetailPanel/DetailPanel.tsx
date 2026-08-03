"use client";
import { useState, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import { useT } from "../../providers/I18nProvider";
import type { ReactNode } from "react";

export interface DetailPanelTab {
  key: string;
  label: string;
  content: ReactNode;
  badge?: number;
}

export interface DetailPanelProps {
  /** 열림 상태 */
  open: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 패널 제목 */
  title: string;
  /** 부제목 */
  subtitle?: string;
  /** 상태 배지 */
  status?: "success" | "warning" | "danger" | "info";
  /** 탭 목록 */
  tabs?: DetailPanelTab[];
  /** 탭이 없을 때 표시할 본문 */
  children?: ReactNode;
  /** 패널 너비(px) */
  width?: number;
  /** 추가 클래스 */
  className?: string;
}

// `dark:` 변형은 OS 선호도를 보지만 이 저장소의 테마는 `[data-theme]` 속성이다 —
// 둘이 어긋나면 라이트 테마에 어두운 배지가 박힌다. 모드를 따라가는 의미 토큰만 쓴다.
const statusStyles: Record<
  NonNullable<DetailPanelProps["status"]>,
  { bg: string; text: string; label: string }
> = {
  success: { bg: "bg-success-light", text: "text-success", label: "성공" },
  warning: { bg: "bg-warning-light", text: "text-warning", label: "경고" },
  danger: { bg: "bg-danger-light", text: "text-danger", label: "위험" },
  info: { bg: "bg-info-light", text: "text-info", label: "정보" },
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
 * @status stable
 * @since 2.2.0
 * @tags data-display
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
  const t = useT();
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
        "fixed top-0 right-0 h-full z-40 flex flex-col bg-card border-l border-border",
        // 떠 있는 면이라 한 겹 그림자로는 배경에서 떨어지지 않는다 — 다층 + 얇은 링.
        "shadow-[-12px_0_36px_-14px_rgba(0,0,0,0.34),-4px_0_12px_-6px_rgba(0,0,0,0.18)] ring-1 ring-black/5",
        "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        open ? "translate-x-0" : "translate-x-full",
        className,
      )}
      style={{ width }}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-border shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground truncate">{title}</h3>
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
          {subtitle && <p className="mt-0.5 text-sm text-muted truncate">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className={cn(
            "shrink-0 ml-2 p-1 rounded-lg cursor-pointer text-muted-light",
            "transition-colors hover:text-foreground hover:bg-card-hover active:bg-muted/15",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          )}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4.5 4.5l9 9M13.5 4.5l-9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* 탭 */}
      {tabs && tabs.length > 0 && (
        <div className="flex border-b border-border px-5 gap-0 shrink-0 overflow-x-auto overscroll-x-contain">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px cursor-pointer",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
                activeTab === tab.key
                  ? "border-primary text-primary-ink"
                  : "border-transparent text-muted hover:text-foreground hover:border-border",
              )}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full min-w-[18px] h-[18px] px-1 text-[10px] font-semibold tabular-nums",
                    activeTab === tab.key
                      ? "bg-primary-light text-primary-ink"
                      : "bg-muted/15 text-muted",
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
