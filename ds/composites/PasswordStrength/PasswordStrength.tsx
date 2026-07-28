"use client";
import { forwardRef, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordRule {
  /** 규칙 ID */
  id: string;
  /** 표시 라벨 */
  label: string;
  /** 검증 함수 */
  test: (pw: string) => boolean;
}

export interface PasswordStrengthProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** 비밀번호 */
  password: string;
  /** 규칙 (없으면 기본 5종) */
  rules?: PasswordRule[];
  /** 라벨 노출 (very weak / weak / ...) */
  showLabel?: boolean;
  /** 규칙 체크리스트 노출 */
  showChecklist?: boolean;
  /** 강도 변경 콜백 */
  onChange?: (level: StrengthLevel, passedRules: string[]) => void;
}

export const DEFAULT_RULES: PasswordRule[] = [
  { id: "len", label: "8자 이상", test: (p) => p.length >= 8 },
  { id: "upper", label: "대문자 포함", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "소문자 포함", test: (p) => /[a-z]/.test(p) },
  { id: "num", label: "숫자 포함", test: (p) => /\d/.test(p) },
  { id: "special", label: "특수문자 포함", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const LEVEL_LABEL: Record<StrengthLevel, string> = {
  0: "매우 약함",
  1: "약함",
  2: "보통",
  3: "강함",
  4: "매우 강함",
};

const LEVEL_COLOR: Record<StrengthLevel, string> = {
  0: "bg-danger",
  1: "bg-warning",
  2: "bg-warning",
  3: "bg-success",
  4: "bg-success",
};

/**
 * 비밀번호 강도 미터 + 규칙 체크리스트.
 * @example
 * <PasswordStrength password={pw} showChecklist />
 * @status stable
 * @since 2.3.0
 * @tags input
 */
export const PasswordStrength = forwardRef<HTMLDivElement, PasswordStrengthProps>(
  function PasswordStrength(
    {
      password,
      rules = DEFAULT_RULES,
      showLabel = true,
      showChecklist = false,
      onChange,
      className,
      ...props
    },
    ref,
  ) {
    const { level, passedIds } = useMemo(() => {
      const passed = rules.filter((r) => r.test(password));
      const ratio = rules.length === 0 ? 0 : passed.length / rules.length;
      const lv: StrengthLevel = Math.min(4, Math.round(ratio * 4)) as StrengthLevel;
      return { level: lv, passedIds: passed.map((r) => r.id) };
    }, [password, rules]);

    // emit on change
    useMemo(() => {
      onChange?.(level, passedIds);
    }, [level, passedIds, onChange]);

    return (
      <div ref={ref} className={cn("w-full flex flex-col gap-2", className)} {...props}>
        <div className="flex items-center gap-2">
          <div className="flex-1 grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  // 색만 바뀌고 움직이는 것이 없어 감속 요청 변형을 붙이지 않는다.
                  "h-1.5 rounded-full transition-colors duration-200",
                  level >= i
                    ? `${LEVEL_COLOR[level]} shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]`
                    : // 빈 칸은 파인 홈으로 읽혀야 채워진 칸이 앞으로 나온다.
                      "bg-surface-soft shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]",
                )}
              />
            ))}
          </div>
          {showLabel && (
            <span className="text-xs text-muted shrink-0 w-16 text-right">
              {LEVEL_LABEL[level]}
            </span>
          )}
        </div>
        {showChecklist && (
          <ul className="flex flex-col gap-0.5 text-xs">
            {rules.map((r) => {
              const ok = passedIds.includes(r.id);
              return (
                <li
                  key={r.id}
                  className={cn("flex items-center gap-1.5", ok ? "text-success" : "text-muted")}
                >
                  <span aria-hidden="true">{ok ? "✓" : "○"}</span>
                  {r.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
);
