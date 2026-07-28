"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type AuthVariant = "centered" | "split" | "branded";

export interface AuthLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 레이아웃 변형 */
  variant?: AuthVariant;
  /** 좌측 브랜드 영역 (split / branded 전용) */
  brandSide?: ReactNode;
  /** 상단 로고 */
  logo?: ReactNode;
  /** 카드 제목 */
  title?: ReactNode;
  /** 카드 부제 */
  subtitle?: ReactNode;
  /** 폼 컨텐츠 (자식 placement) */
  children?: ReactNode;
  /** 카드 하단 푸터 (예: "계정이 없으신가요?") */
  footer?: ReactNode;
  /** 페이지 푸터 (저작권 등) */
  pageFooter?: ReactNode;
}

/**
 * 인증 페이지 표준 레이아웃 (login / signup / reset 공용).
 * @example
 * <AuthLayout variant="split" logo={<Logo/>} title="로그인"><LoginForm/></AuthLayout>
 * @status stable
 * @since 2.3.0
 * @tags layout
 */
export const AuthLayout = forwardRef<HTMLDivElement, AuthLayoutProps>(function AuthLayout(
  {
    variant = "centered",
    brandSide,
    logo,
    title,
    subtitle,
    children,
    footer,
    pageFooter,
    className,
    ...props
  },
  ref,
) {
  const card = (
    <div className="w-full max-w-md mx-auto">
      {logo && <div className="flex justify-center mb-6">{logo}</div>}
      <div className="rounded-xl border border-border bg-surface shadow-sm p-6 sm:p-8">
        {(title || subtitle) && (
          <div className="mb-6 text-center">
            {title && <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
        )}
        <div>{children}</div>
        {footer && (
          <div className="mt-6 pt-4 border-t border-border text-center text-sm text-muted">
            {footer}
          </div>
        )}
      </div>
      {pageFooter && <div className="mt-6 text-center text-xs text-muted">{pageFooter}</div>}
    </div>
  );

  if (variant === "centered") {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen flex items-center justify-center bg-background px-4 py-10",
          className,
        )}
        {...props}
      >
        {card}
      </div>
    );
  }

  if (variant === "branded") {
    return (
      <div
        ref={ref}
        className={cn(
          "relative min-h-screen flex items-center justify-center px-4 py-10",
          className,
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover -z-10" />
        <div className="relative z-10">{card}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("min-h-screen grid lg:grid-cols-2", className)} {...props}>
      <aside className="hidden lg:flex items-center justify-center bg-primary text-white p-10">
        <div className="max-w-md">
          {brandSide ?? (
            <>
              <div className="text-3xl font-bold mb-3">Welcome</div>
              <p className="text-white/80">로그인하고 모든 기능을 사용해보세요.</p>
            </>
          )}
        </div>
      </aside>
      <main className="flex items-center justify-center px-4 py-10 bg-background">{card}</main>
    </div>
  );
});
