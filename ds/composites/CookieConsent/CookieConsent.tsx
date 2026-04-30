"use client";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface CookieCategory {
  /** 카테고리 ID */
  id: string;
  /** 라벨 */
  label: string;
  /** 설명 */
  description?: string;
  /** 필수(끌 수 없음) */
  required?: boolean;
}

export interface CookieConsentProps extends HTMLAttributes<HTMLDivElement> {
  /** 메시지 본문 */
  message?: ReactNode;
  /** 카테고리 (custom 모드) */
  categories?: CookieCategory[];
  /** "모두 수락" 라벨 */
  acceptLabel?: string;
  /** "필수만" 라벨 */
  rejectLabel?: string;
  /** "맞춤설정" 라벨 (categories 있을 때) */
  customizeLabel?: string;
  /** 정책 링크 */
  policyHref?: string;
  /** localStorage 키 */
  storageKey?: string;
  /** 위치 */
  position?: "bottom" | "bottom-left" | "bottom-right";
  /** 동의 결과 콜백 */
  onConsent?: (categories: Record<string, boolean>) => void;
}

const positionClass = {
  bottom: "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
} as const;

/**
 * GDPR/CCPA 쿠키 동의 배너.
 * @example
 * <CookieConsent message="이 사이트는 쿠키를 사용합니다" policyHref="/privacy" />
 * @status stable
 * @since 2.3.0
 * @tags compliance
 */
export const CookieConsent = forwardRef<HTMLDivElement, CookieConsentProps>(function CookieConsent(
  {
    message = "더 나은 경험을 위해 쿠키를 사용합니다.",
    categories,
    acceptLabel = "모두 수락",
    rejectLabel = "필수만",
    customizeLabel = "맞춤 설정",
    policyHref,
    storageKey = "junds-cookie-consent",
    position = "bottom",
    onConsent,
    className,
    ...props
  },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries((categories ?? []).map((c) => [c.id, c.required ?? false]))
  );

  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (!v) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  if (!visible) return null;

  const persist = (result: Record<string, boolean>) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ at: Date.now(), result }));
    } catch {}
    onConsent?.(result);
    setVisible(false);
  };

  const acceptAll = () => {
    const all = Object.fromEntries((categories ?? [{ id: "all", label: "all" }]).map((c) => [c.id, true]));
    persist(all);
  };
  const rejectAll = () => {
    const only = Object.fromEntries((categories ?? [{ id: "all", label: "all" }]).map((c) => [c.id, c.required ?? false]));
    persist(only);
  };
  const saveCustom = () => persist(selected);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="쿠키 동의"
      className={cn(
        "fixed z-50 max-w-lg w-[calc(100%-2rem)] rounded-xl border border-border bg-surface shadow-2xl p-4",
        positionClass[position],
        className,
      )}
      {...props}
    >
      <p className="text-sm text-foreground">
        {message}
        {policyHref && (
          <>
            {" "}
            <a href={policyHref} className="text-primary underline hover:opacity-80">정책 보기</a>
          </>
        )}
      </p>
      {categories && showCustom && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {categories.map((c) => (
            <label key={c.id} className={cn("flex items-start gap-2 text-sm", c.required && "opacity-70")}>
              <input
                type="checkbox"
                checked={selected[c.id] ?? false}
                disabled={c.required}
                onChange={(e) => setSelected((s) => ({ ...s, [c.id]: e.target.checked }))}
                className="mt-0.5"
              />
              <div>
                <div className="font-medium">{c.label}{c.required && <span className="ml-1 text-[10px] text-muted">(필수)</span>}</div>
                {c.description && <div className="text-xs text-muted">{c.description}</div>}
              </div>
            </label>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {categories && !showCustom && (
          <button type="button" onClick={() => setShowCustom(true)} className="text-sm px-3 py-1.5 rounded-md hover:bg-surface-soft cursor-pointer">
            {customizeLabel}
          </button>
        )}
        <button type="button" onClick={rejectAll} className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-surface-soft cursor-pointer">
          {rejectLabel}
        </button>
        <button
          type="button"
          onClick={categories && showCustom ? saveCustom : acceptAll}
          className="text-sm px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary-hover cursor-pointer"
        >
          {categories && showCustom ? "선택 저장" : acceptLabel}
        </button>
      </div>
    </div>
  );
});
