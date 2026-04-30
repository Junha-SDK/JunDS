"use client";
import { forwardRef, useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

export interface PasswordRule {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** 에러 상태 */
  error?: boolean;
  /** 비밀번호 강도 표시 */
  showStrength?: boolean;
  /** 규칙 체크리스트 표시 */
  showRules?: boolean;
  /** 커스텀 규칙 (기본: 8자, 대문자, 소문자, 숫자, 특수문자) */
  rules?: PasswordRule[];
  /** 크기 */
  size?: "sm" | "md" | "lg";
}

const defaultRules: PasswordRule[] = [
  { key: "length", label: "8자 이상", test: (v) => v.length >= 8 },
  { key: "upper", label: "대문자 포함 (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "소문자 포함 (a-z)", test: (v) => /[a-z]/.test(v) },
  { key: "number", label: "숫자 포함 (0-9)", test: (v) => /[0-9]/.test(v) },
  { key: "special", label: "특수문자 포함 (!@#$...)", test: (v) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(v) },
];

const sizeStyles = {
  sm: "h-8 px-2.5 text-xs rounded-md",
  md: "h-9 px-3 text-sm rounded-lg",
  lg: "h-11 px-4 text-base rounded-xl",
};

type StrengthLevel = "none" | "weak" | "fair" | "good" | "strong";

function getStrength(value: string, rules: PasswordRule[]): { level: StrengthLevel; score: number; passed: number } {
  if (!value) return { level: "none", score: 0, passed: 0 };
  const passed = rules.filter((r) => r.test(value)).length;
  const score = passed / rules.length;
  // 추가 점수: 길이 보너스
  const lengthBonus = Math.min(value.length / 16, 1) * 0.2;
  const total = Math.min(score + lengthBonus, 1);

  if (total < 0.3) return { level: "weak", score: total, passed };
  if (total < 0.5) return { level: "fair", score: total, passed };
  if (total < 0.8) return { level: "good", score: total, passed };
  return { level: "strong", score: total, passed };
}

const strengthConfig: Record<StrengthLevel, { label: string; color: string; bgColor: string }> = {
  none: { label: "", color: "", bgColor: "bg-gray-200" },
  weak: { label: "취약", color: "text-red-600", bgColor: "bg-red-500" },
  fair: { label: "보통", color: "text-orange-600", bgColor: "bg-orange-500" },
  good: { label: "양호", color: "text-blue-600", bgColor: "bg-blue-500" },
  strong: { label: "강력", color: "text-green-600", bgColor: "bg-green-500" },
};

/**
 * 보안 비밀번호 입력
 *
 * 기능:
 * - 표시/숨김 토글 (눈 아이콘)
 * - 실시간 강도 게이지 (취약/보통/양호/강력)
 * - 규칙 체크리스트 (8자, 대/소문자, 숫자, 특수문자)
 * - 붙여넣기 방지 옵션
 *
 * @example
 * <PasswordInput showStrength showRules placeholder="비밀번호" />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, showStrength, showRules, rules, size = "md", className, value, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const activeRules = rules || defaultRules;
    const strValue = typeof value === "string" ? value : "";
    const strength = useMemo(() => getStrength(strValue, activeRules), [strValue, activeRules]);

    return (
      <div className={cn("w-full", className)}>
        {/* Input */}
        <div className="relative">
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            value={value}
            autoComplete="new-password"
            className={cn(
              "w-full border bg-white transition-all duration-150 pr-10",
              "placeholder:text-muted-light",
              "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,63,63,0.15)]" : "border-border",
              sizeStyles[size],
            )}
            {...props}
          />
          {/* 표시/숨김 토글 */}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible(!visible)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer p-0.5"
            aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {visible ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.5 2.5l11 11M6.5 6.8a2 2 0 002.7 2.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M4.3 4.6C2.9 5.7 2 7.2 2 8c0 1.7 2.7 4.5 6 4.5.9 0 1.7-.2 2.5-.5M8 3.5c3.3 0 6 2.8 6 4.5 0 .8-.8 2.2-2.2 3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8c0-1.7 2.7-4.5 6-4.5S14 6.3 14 8s-2.7 4.5-6 4.5S2 9.7 2 8z" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            )}
          </button>
        </div>

        {/* 강도 게이지 */}
        {showStrength && strValue && (
          <div className="mt-2">
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4].map((i) => {
                const filled = strength.level === "weak" ? i <= 1
                  : strength.level === "fair" ? i <= 2
                  : strength.level === "good" ? i <= 3
                  : strength.level === "strong" ? i <= 4
                  : false;
                return (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      filled ? strengthConfig[strength.level].bgColor : "bg-gray-200",
                    )}
                  />
                );
              })}
              <span className={cn("text-[11px] font-semibold ml-1.5 min-w-[28px]", strengthConfig[strength.level].color)}>
                {strengthConfig[strength.level].label}
              </span>
            </div>
          </div>
        )}

        {/* 규칙 체크리스트 */}
        {showRules && strValue && (
          <div className="mt-2 flex flex-col gap-1">
            {activeRules.map((rule) => {
              const passed = rule.test(strValue);
              return (
                <div key={rule.key} className="flex items-center gap-1.5">
                  {passed ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-green-500 shrink-0">
                      <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.15" />
                      <path d="M4 7.2l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-300 shrink-0">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  )}
                  <span className={cn("text-[11px]", passed ? "text-green-600" : "text-muted-light")}>
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
