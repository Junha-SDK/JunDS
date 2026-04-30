"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface KeyValueItem {
  key: string;
  label: string;
  value: ReactNode;
  span?: number;
}

export interface KeyValueGridProps {
  /** 표시할 키-값 항목 목록 */
  items: KeyValueItem[];
  /** 그리드 열 수 */
  columns?: 2 | 3 | 4;
  /** 테두리 스타일 */
  bordered?: boolean;
  /** 추가 클래스 */
  className?: string;
}

const columnStyles: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
};

const spanStyles: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-1 sm:col-span-2",
  3: "col-span-1 sm:col-span-2 md:col-span-3",
  4: "col-span-1 sm:col-span-2 md:col-span-4",
};

/**
 * 키-값 그리드
 * @description 필드명과 값을 그리드로 배치하여 정보를 표시하는 컴포넌트
 * @example
 * <KeyValueGrid
 *   items={[
 *     { key: "name", label: "이름", value: "홍길동" },
 *     { key: "email", label: "이메일", value: "hong@example.com" },
 *   ]}
 *   columns={2}
 *   bordered
 * />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function KeyValueGrid({ items, columns = 3, bordered, className }: KeyValueGridProps) {
  return (
    <div
      className={cn(
        "grid gap-px",
        columnStyles[columns],
        bordered && "border border-border rounded-lg overflow-hidden bg-border",
        !bordered && "gap-4",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.key}
          className={cn(
            "space-y-1 transition-colors duration-150",
            spanStyles[item.span ?? 1],
            bordered ? "bg-white p-3" : "p-0",
          )}
        >
          <dt className="text-[10px] font-medium text-muted uppercase tracking-wider">
            {item.label}
          </dt>
          <dd className="text-sm font-medium text-foreground rounded px-1 -mx-1 transition-colors duration-150 hover:bg-gray-50">{item.value}</dd>
        </div>
      ))}
    </div>
  );
}
