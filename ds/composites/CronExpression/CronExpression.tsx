"use client";
import { useState, useMemo } from "react";
import { cn } from "../../utils/cn";

export interface CronExpressionProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const FIELDS = [
  { label: "분", options: Array.from({length: 60}, (_, i) => String(i)), placeholder: "*" },
  { label: "시", options: Array.from({length: 24}, (_, i) => String(i)), placeholder: "*" },
  { label: "일", options: Array.from({length: 31}, (_, i) => String(i + 1)), placeholder: "*" },
  { label: "월", options: Array.from({length: 12}, (_, i) => String(i + 1)), placeholder: "*" },
  { label: "요일", options: ["0","1","2","3","4","5","6"], placeholder: "*" },
];

const DAY_NAMES = ["일","월","화","수","목","금","토"];

function describeCron(parts: string[]): string {
  if (parts.length !== 5) return "잘못된 형식";
  const [min, hour, day, month, dow] = parts;
  const descs: string[] = [];
  if (min !== "*") descs.push(`${min}분`);
  if (hour !== "*") descs.push(`${hour}시`);
  if (day !== "*") descs.push(`${day}일`);
  if (month !== "*") descs.push(`${month}월`);
  if (dow !== "*") descs.push(dow.split(",").map(d => DAY_NAMES[+d] ?? d).join(",") + "요일");
  if (descs.length === 0) return "매 분마다";
  return descs.join(" ") + " 실행";
}

export function CronExpression({ value, onChange, className }: CronExpressionProps) {
  const parts = value.split(" ");
  const safeParts = parts.length === 5 ? parts : ["*","*","*","*","*"];

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
            <label className="block text-[10px] font-semibold text-muted uppercase mb-1">{field.label}</label>
            <input
              value={safeParts[i]}
              onChange={(e) => setPart(i, e.target.value)}
              placeholder={field.placeholder}
              className="w-full h-8 px-2 text-sm text-center border border-border rounded-lg outline-none focus:border-primary tabular-nums font-mono"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
        <span className="text-xs text-muted font-mono flex-1">{value || "* * * * *"}</span>
        <span className="text-xs text-primary font-medium">{description}</span>
      </div>
    </div>
  );
}
