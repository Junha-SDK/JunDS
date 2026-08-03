"use client";
import { forwardRef, useState, type FormEvent } from "react";
import { cn } from "../../utils/cn";
import { Slot, Slottable } from "../../utils/Slot";
import type { HTMLAttributes, ReactNode } from "react";

export type NewsletterStatus = "idle" | "submitting" | "success" | "error";

export interface NewsletterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onSubmit"> {
  /** 제목 */
  title?: ReactNode;
  /** 부제 */
  description?: ReactNode;
  /** 인풋 placeholder */
  placeholder?: string;
  /** 버튼 라벨 */
  submitLabel?: string;
  /** 성공 메시지 */
  successMessage?: ReactNode;
  /** 에러 메시지 */
  errorMessage?: ReactNode;
  /** 개인정보 동의 라벨 */
  consentLabel?: ReactNode;
  /** 동의 필수 여부 */
  requireConsent?: boolean;
  /** 제출 핸들러 (Promise 반환) */
  onSubscribe?: (email: string) => Promise<void> | void;
  /** 레이아웃 */
  variant?: "inline" | "stacked" | "card";
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/**
 * 뉴스레터 구독 폼 (Mailchimp/Beehiiv/Substack 통합용).
 * @example
 * <Newsletter title="업데이트 받기" onSubscribe={async (email) => api.subscribe(email)} />
 * @status stable
 * @since 2.3.0
 * @tags marketing
 */
export const Newsletter = forwardRef<HTMLDivElement, NewsletterProps>(function Newsletter(
  {
    title,
    description,
    placeholder = "이메일 주소",
    submitLabel = "구독하기",
    successMessage = "구독 완료! 받은 편지함을 확인해주세요.",
    errorMessage = "문제가 발생했습니다. 다시 시도해주세요.",
    consentLabel,
    requireConsent = false,
    onSubscribe,
    variant = "stacked",
    asChild,
    className,
    children,
    ...props
  },
  ref,
) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("올바른 이메일을 입력해주세요");
      return;
    }
    if (requireConsent && !consent) {
      setError("개인정보 처리 동의가 필요합니다");
      return;
    }
    setError(null);
    setStatus("submitting");
    try {
      await onSubscribe?.(email);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const inner = (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-3",
        variant === "inline" && "sm:flex-row sm:gap-2 sm:items-center",
      )}
    >
      <div className={cn("flex gap-2", variant === "inline" ? "sm:flex-1" : "flex-col")}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-label="이메일"
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55"
        />
        {variant === "inline" && (
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-md bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
          >
            {status === "submitting" ? "..." : submitLabel}
          </button>
        )}
      </div>
      {variant !== "inline" && (
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-md bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
        >
          {status === "submitting" ? "구독 중..." : submitLabel}
        </button>
      )}
      {requireConsent && (
        <label className="flex items-start gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 accent-primary"
          />
          <span>{consentLabel ?? "개인정보 수집·이용에 동의합니다"}</span>
        </label>
      )}
      {error && (
        <div role="alert" className="text-xs text-danger">
          {error}
        </div>
      )}
      {status === "success" && (
        <div role="status" className="text-xs text-success">
          {successMessage}
        </div>
      )}
      {status === "error" && (
        <div role="alert" className="text-xs text-danger">
          {errorMessage}
        </div>
      )}
    </form>
  );

  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref as never}
      className={cn(
        variant === "card" && "rounded-xl border border-border bg-surface p-6",
        className,
      )}
      {...props}
    >
      {asChild ? <Slottable>{children}</Slottable> : null}
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
      )}
      {inner}
    </Comp>
  );
});
