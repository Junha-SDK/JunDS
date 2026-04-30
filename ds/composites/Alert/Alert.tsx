"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export type AlertVariant = "info" | "success" | "warning" | "danger";

/**
 * 알림 메시지 컴포넌트.
 *
 * 정보, 성공, 경고, 위험 4가지 변형을 지원합니다.
 * 왼쪽 색상 바 + 아이콘 + 제목 + 본문으로 구성됩니다.
 *
 * @example
 * <Alert variant="success" title="완료">작업이 성공했습니다.</Alert>
 * <Alert variant="danger" onClose={dismiss}>오류가 발생했습니다.</Alert>
 */
export interface AlertProps {
  /**
   * 알림 스타일 변형.
   * - `"info"` — 파란색. 일반 정보, 안내 메시지에 사용합니다.
   * - `"success"` — 초록색. 작업 완료, 성공 메시지에 사용합니다.
   * - `"warning"` — 노란색. 주의 사항, 경고 메시지에 사용합니다.
   * - `"danger"` — 빨간색. 오류, 위험, 긴급 메시지에 사용합니다.
   *
   * @default "info"
   */
  variant?: AlertVariant;
  /**
   * 알림 제목 (선택).
   * 본문 위에 굵은 글씨로 표시됩니다.
   * 간결한 요약이 필요할 때 사용합니다.
   *
   * @example title="배포 완료"
   */
  title?: string;
  /**
   * 알림 본문 내용.
   * 텍스트 또는 JSX를 전달할 수 있습니다.
   */
  children: ReactNode;
  /**
   * 커스텀 아이콘.
   * 미지정 시 variant에 맞는 기본 아이콘이 표시됩니다.
   * 기본 아이콘을 덮어쓰고 싶을 때 사용합니다.
   *
   * @example icon={<CustomIcon />}
   */
  icon?: ReactNode;
  /**
   * 닫기 버튼 클릭 시 호출되는 콜백.
   * 설정하면 우측 상단에 X 닫기 버튼이 표시됩니다.
   * 미설정 시 닫기 버튼이 렌더링되지 않습니다.
   *
   * @example onClose={() => setVisible(false)}
   */
  onClose?: () => void;
  /** 루트 요소에 추가할 CSS 클래스 */
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-primary/5 border-primary/20 border-l-4 border-l-primary text-primary",
  success: "bg-success/5 border-success/20 border-l-4 border-l-success text-success",
  warning: "bg-warning/5 border-warning/20 border-l-4 border-l-warning text-warning",
  danger: "bg-danger/5 border-danger/20 border-l-4 border-l-danger text-danger",
};

const defaultIcons: Record<AlertVariant, ReactNode> = {
  info: (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8v4.5M9 5.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 9.5l2 2 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L1.5 15.5h15L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 7v3.5M9 13h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  danger: (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 6.5l5 5M11.5 6.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * 알림 메시지 컴포넌트.
 *
 * 정보, 성공, 경고, 위험 4가지 변형을 지원합니다.
 * 왼쪽 색상 바 + 아이콘 + 제목 + 본문으로 구성됩니다.
 *
 * @example
 * <Alert variant="success" title="완료">작업이 성공했습니다.</Alert>
 * <Alert variant="danger" onClose={dismiss}>오류가 발생했습니다.</Alert>
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "info", title, children, icon, onClose, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-3 p-4 rounded-xl border",
        variantStyles[variant],
        className,
      )}
      role="alert"
    >
      <span className="shrink-0 mt-0.5">{icon || defaultIcons[variant]}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold mb-0.5">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 hover:opacity-70 transition-opacity cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
},
);
Alert.displayName = "Alert";
