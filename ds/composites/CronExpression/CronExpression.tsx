"use client";
import { useState, useMemo } from "react";
import { cn } from "../../utils/cn";

export interface CronExpressionProps {
  /** Cron 표현식 값 */
  value: string;
  /** 값 변경 콜백 */
  onChange: (value: string) => void;
  /** 추가 클래스 */
  className?: string;
}

const FIELDS = [
  { label: "분", options: Array.from({ length: 60 }, (_, i) => String(i)), placeholder: "*" },
  { label: "시", options: Array.from({ length: 24 }, (_, i) => String(i)), placeholder: "*" },
  { label: "일", options: Array.from({ length: 31 }, (_, i) => String(i + 1)), placeholder: "*" },
  { label: "월", options: Array.from({ length: 12 }, (_, i) => String(i + 1)), placeholder: "*" },
  { label: "요일", options: ["0", "1", "2", "3", "4", "5", "6"], placeholder: "*" },
];

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function describeCron(parts: string[]): string {
  if (parts.length !== 5) return "잘못된 형식";
  const [min, hour, day, month, dow] = parts;
  const descs: string[] = [];
  if (min !== "*") descs.push(`${min}분`);
  if (hour !== "*") descs.push(`${hour}시`);
  if (day !== "*") descs.push(`${day}일`);
  if (month !== "*") descs.push(`${month}월`);
  if (dow !== "*")
    descs.push(
      dow
        .split(",")
        .map((d) => DAY_NAMES[+d] ?? d)
        .join(",") + "요일",
    );
  if (descs.length === 0) return "매 분마다";
  return descs.join(" ") + " 실행";
}

/**
 * cron 표현식을 시각적으로 편집하는 입력기.
 * @example
 * <CronExpression value={cron} onChange={setCron} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function CronExpression({ value, onChange, className }: CronExpressionProps) {
  const parts = value.split(" ");
  const safeParts = parts.length === 5 ? parts : ["*", "*", "*", "*", "*"];

  const setPart = (idx: number, val: string) => {
    const next = [...safeParts];
    next[idx] = val || "*";
    onChange(next.join(" "));
  };

  const description = useMemo(() => describeCron(safeParts), [safeParts]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2">
        {FIELDS.map((field, i) => (
          <div key={i} className="flex-1 min-w-0">
            <label className="block text-[10px] font-semibold text-muted uppercase mb-1">
              {field.label}
            </label>
            <input
              value={safeParts[i]}
              onChange={(e) => setPart(i, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                "w-full h-8 px-2 text-sm text-center bg-card border border-border rounded-lg tabular-nums font-mono",
                "transition-[border-color,box-shadow] duration-200 ease-out",
                "hover:border-muted-light/60",
                "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
              )}
            />
          </div>
        ))}
      </div>
      {/* gray-50 은 라이트 전용 — 다크에서도 한 단계 뜬 면으로 남는 muted 반투명으로 옮긴다. */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/10 border border-border-light rounded-lg">
        <span className="text-xs text-muted font-mono flex-1 min-w-0 truncate">
          {value || "* * * * *"}
        </span>
        <span className="text-xs text-primary-ink font-medium shrink-0 whitespace-nowrap">
          {description}
        </span>
      </div>
    </div>
  );
}
