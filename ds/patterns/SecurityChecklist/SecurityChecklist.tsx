"use client";
import { cn } from "../../utils/cn";
import { Button } from "../../primitives/Button";
import type { ReactNode } from "react";

export interface SecurityCheckItem {
  key: string;
  title: string;
  description: string;
  status: "secure" | "insecure" | "attention" | "unchecked";
  /** 조치 버튼 */
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
}

export interface SecurityChecklistProps {
  items: SecurityCheckItem[];
  title?: string;
  className?: string;
}

const statusIcons: Record<string, ReactNode> = {
  secure: (
    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5c-.5.3-1.7.8-3.2 1C4.3 4 4 5.5 4 7c0 3.2 1.8 5.5 4 6.5 2.2-1 4-3.3 4-6.5 0-1.5-.3-3-0.8-4.5-1.5-.2-2.7-.7-3.2-1z" stroke="#16a34a" strokeWidth="1.2" fill="#dcfce7" />
        <path d="M6 8l1.5 1.5L10 7" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  ),
  insecure: (
    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5c-.5.3-1.7.8-3.2 1C4.3 4 4 5.5 4 7c0 3.2 1.8 5.5 4 6.5 2.2-1 4-3.3 4-6.5 0-1.5-.3-3-0.8-4.5-1.5-.2-2.7-.7-3.2-1z" stroke="#dc2626" strokeWidth="1.2" fill="#fef2f2" />
        <path d="M6.5 6.5l3 3M9.5 6.5l-3 3" stroke="#dc2626" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </div>
  ),
  attention: (
    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5c-.5.3-1.7.8-3.2 1C4.3 4 4 5.5 4 7c0 3.2 1.8 5.5 4 6.5 2.2-1 4-3.3 4-6.5 0-1.5-.3-3-0.8-4.5-1.5-.2-2.7-.7-3.2-1z" stroke="#d97706" strokeWidth="1.2" fill="#fef3c7" />
        <path d="M8 5.5v3M8 10.5h.01" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </div>
  ),
  unchecked: (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5c-.5.3-1.7.8-3.2 1C4.3 4 4 5.5 4 7c0 3.2 1.8 5.5 4 6.5 2.2-1 4-3.3 4-6.5 0-1.5-.3-3-0.8-4.5-1.5-.2-2.7-.7-3.2-1z" stroke="#9ca3af" strokeWidth="1.2" fill="#f3f4f6" />
        <path d="M7 8h2" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </div>
  ),
};

/**
 * 보안 체크리스트 — 보안 설정 현황을 한눈에 확인 + 조치
 * @example
 * <SecurityChecklist items={[
 *   { key:"2fa", title:"2단계 인증", description:"계정 보호를 위해 2FA를 활성화하세요", status:"insecure", action:{ label:"설정", onClick:setup2FA } },
 *   { key:"pw", title:"비밀번호 강도", description:"마지막 변경: 90일 전", status:"attention" },
 * ]} />
 */
export function SecurityChecklist({ items, title = "보안 체크리스트", className }: SecurityChecklistProps) {
  const secureCount = items.filter((i) => i.status === "secure").length;
  const totalChecked = items.filter((i) => i.status !== "unchecked").length;

  return (
    <div className={cn("bg-white border border-border rounded-xl overflow-hidden", className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-light">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            secureCount === items.length ? "bg-green-100 text-green-700" : secureCount >= items.length * 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700",
          )}>
            {secureCount}/{items.length} 안전
          </span>
        </div>
        {/* Progress */}
        <div className="flex gap-0.5">
          {items.map((item) => (
            <div
              key={item.key}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                item.status === "secure" ? "bg-green-500" :
                item.status === "insecure" ? "bg-red-400" :
                item.status === "attention" ? "bg-amber-400" : "bg-gray-200",
              )}
            />
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border-light">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-3 px-5 py-3">
            {item.icon || statusIcons[item.status]}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">{item.title}</div>
              <div className="text-xs text-muted">{item.description}</div>
            </div>
            {item.action && (
              <Button
                size="xs"
                variant={item.status === "insecure" ? "primary" : "secondary"}
                onClick={item.action.onClick}
              >
                {item.action.label}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
