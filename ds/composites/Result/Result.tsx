"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface ResultProps {
  /** 결과 상태 */
  status: "success" | "error" | "warning" | "info" | "404" | "403";
  /** 결과 제목 */
  title: string;
  /** 보조 설명 */
  description?: string;
  /** 하단 액션 영역 */
  extra?: ReactNode;
  /** 커스텀 아이콘 */
  icon?: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

// 아이콘 색은 Tailwind 팔레트(green/red/yellow/blue/orange/gray-500)를 직접 쓰고 있었다.
// 그 값들은 다크에서 그대로 튀고, 같은 뜻의 의미 토큰이 이미 있다 — 상태별 토큰으로 옮긴다.
const statusIcons: Record<ResultProps["status"], ReactNode> = {
  success: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-success">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M20 33l8 8 16-16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-danger">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M22 22l20 20M42 22L22 42"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  warning: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-warning">
      <path
        d="M32 6L2 58h60L32 6z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M32 26v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="47" r="1.5" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-info">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2.5" />
      <path d="M32 28v16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="20" r="1.5" fill="currentColor" />
    </svg>
  ),
  "404": (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-muted-light">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M22 24h4v8h-4M30 24h4v8h-4M38 24h4v8h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 42c4-4 8-6 12-6s8 2 12 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  "403": (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-warning">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2.5" />
      <rect x="22" y="28" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M26 28v-4a6 6 0 1112 0v4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="37" r="2" fill="currentColor" />
    </svg>
  ),
};

/**
 * 결과 페이지 컴포넌트
 * @description 성공, 실패, 경고, 정보 등의 결과 상태를 표시합니다.
 * @example
 * <Result status="success" title="결제가 완료되었습니다" description="주문 내역을 확인해주세요" extra={<Button>홈으로</Button>} />
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export function Result({ status, title, description, extra, icon, className }: ResultProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in motion-reduce:animate-none",
        className,
      )}
    >
      <div className="mb-6 transition-colors duration-200">{icon ?? statusIcons[status]}</div>
      <h2 className="text-xl font-semibold text-foreground mb-2 transition-colors duration-200">
        {title}
      </h2>
      {description && <p className="text-sm text-muted max-w-md">{description}</p>}
      {extra && <div className="mt-6 flex gap-3">{extra}</div>}
    </div>
  );
}
