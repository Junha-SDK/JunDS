"use client";
import { useState, forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface BannerProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 배너 유형 */
  variant?: "info" | "success" | "warning" | "danger";
  /** 닫기 버튼 표시 여부 */
  dismissible?: boolean;
  /** 좌측 아이콘 */
  icon?: ReactNode;
  /** 우측 액션 영역 */
  action?: ReactNode;
  /** 추가 클래스 */
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
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(
  ({ children, variant = "info", dismissible = true, icon, action, className }, ref) => {
    const [visible, setVisible] = useState(true);
    if (!visible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium",
          // 색면 하나로 끝내면 배경과 같은 평면에 눕는다 — 상단 인셋 하이라이트로 면을 세운다.
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.08)]",
          variantStyles[variant],
          className,
        )}
        role="banner"
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="min-w-0 text-center">{children}</span>
        {action && <span className="shrink-0">{action}</span>}
        {dismissible && (
          <button
            type="button"
            onClick={() => setVisible(false)}
            className={cn(
              "shrink-0 ml-2 p-1 rounded-lg cursor-pointer transition-colors duration-150",
              "hover:bg-white/20 active:bg-white/30",
              // 배너는 색면 위라 배경색 오프셋이 통하지 않는다 — 흰 링을 바로 얹는다.
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
            )}
            aria-label="배너 닫기"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3.5 3.5l7 7M10.5 3.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    );
  },
);
Banner.displayName = "Banner";
