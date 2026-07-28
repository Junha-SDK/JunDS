"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { useT } from "../../providers/I18nProvider";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type LoadingButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type LoadingButtonSize = "sm" | "md" | "lg";

export interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 로딩 상태 */
  loading?: boolean;
  /** 로딩 중 표시할 텍스트 (없으면 기존 children 유지) */
  loadingText?: ReactNode;
  /** 변형 */
  variant?: LoadingButtonVariant;
  /** 크기 */
  size?: LoadingButtonSize;
  /** full-width */
  fullWidth?: boolean;
  /** 좌측 아이콘 */
  leftIcon?: ReactNode;
}

const variantClass: Record<LoadingButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover disabled:bg-primary/50 shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.16)]",
  secondary:
    "border border-border bg-surface hover:bg-surface-soft active:bg-surface-soft text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
  ghost: "hover:bg-surface-soft active:bg-surface-soft text-foreground",
  // 링 색은 변형을 따라간다 — 빨간 버튼에 보라 링이 뜨면 다른 컴포넌트로 읽힌다.
  danger:
    "bg-danger text-white hover:bg-danger-hover active:bg-danger-hover disabled:opacity-50 focus-visible:ring-danger/55 shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.16)]",
};

const sizeClass: Record<LoadingButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

/**
 * 로딩 상태를 가진 버튼 (네트워크 호출 중 자동 비활성).
 * @example
 * <LoadingButton loading={isSubmitting} loadingText="저장 중...">저장</LoadingButton>
 * @status stable
 * @since 2.3.0
 * @tags input
 */
export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  function LoadingButton(
    {
      loading,
      loadingText,
      variant = "primary",
      size = "md",
      fullWidth,
      leftIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) {
    const t = useT();
    const explicitAriaLabel = props["aria-label"];
    const hasContent =
      children != null ||
      (loading && loadingText != null) ||
      leftIcon != null ||
      props["aria-labelledby"] != null;
    const computedAriaLabel = explicitAriaLabel ?? (hasContent ? undefined : t("ariaButton"));

    return (
      <button
        ref={ref}
        type="button"
        disabled={loading || disabled}
        aria-busy={loading || undefined}
        aria-label={computedAriaLabel}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors cursor-pointer",
          // `ring-ring` 은 이 저장소에 --color-ring 이 없어 링 색이 지정되지 않은 채로
          // currentColor 로 떨어진다 — primary 버튼에선 링이 흰색이라 배경에 묻힌다.
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:scale-[0.97] motion-reduce:active:scale-100 motion-reduce:transition-none",
          "disabled:cursor-not-allowed disabled:active:scale-100",
          variantClass[variant],
          sizeClass[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <svg
            // 스피너는 "지금 처리 중"이라는 유일한 신호라 감속요청에서도 멈추면 안 된다.
            // 없애는 대신 회전을 느리게 해서 전정계 자극만 줄인다.
            className="animate-spin motion-reduce:animate-[spin_2.5s_linear_infinite]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="4"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{loading && loadingText ? loadingText : children}</span>
      </button>
    );
  },
);
