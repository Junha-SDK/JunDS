"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface DescriptionItem {
  key: string;
  label: string;
  value: ReactNode;
  span?: number;
}

export interface DescriptionsProps {
  items: DescriptionItem[];
  title?: string;
  columns?: number;
  bordered?: boolean;
  layout?: "horizontal" | "vertical";
  className?: string;
}

/**
 * 디스크립션 — 키-값 쌍 표시 컴포넌트
 * @example
 * <Descriptions
 *   title="사용자 정보"
 *   items={[
 *     { key:"name", label:"이름", value:"홍길동" },
 *     { key:"email", label:"이메일", value:"hong@example.com" },
 *   ]}
 *   columns={2}
 *   bordered
 * />
 */
export function Descriptions({
  items,
  title,
  columns = 2,
  bordered = false,
  layout = "horizontal",
  className,
}: DescriptionsProps) {
  // 아이템을 행으로 분할
  const rows: DescriptionItem[][] = [];
  let currentRow: DescriptionItem[] = [];
  let currentSpan = 0;

  items.forEach((item) => {
    const span = item.span ?? 1;
    if (currentSpan + span > columns && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      currentSpan = 0;
    }
    currentRow.push(item);
    currentSpan += span;
    if (currentSpan >= columns) {
      rows.push(currentRow);
      currentRow = [];
      currentSpan = 0;
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

  if (bordered) {
    return (
      <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
        {title && (
          <div className="px-4 py-3 bg-gray-50 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
        )}
        <table className="w-full">
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-border last:border-b-0">
                {row.map((item) => {
                  const span = item.span ?? 1;
                  if (layout === "vertical") {
                    return (
                      <td key={item.key} colSpan={span} className="border-r border-border last:border-r-0 p-0">
                        <div className="px-3 py-1.5 bg-gray-50 text-xs font-medium text-muted border-b border-border">
                          {item.label}
                        </div>
                        <div className="px-3 py-2 text-sm text-foreground">{item.value}</div>
                      </td>
                    );
                  }
                  return (
                    <td key={item.key} colSpan={span * 2} className="p-0">
                      <div className="flex">
                        <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-muted w-[120px] shrink-0 border-r border-border flex items-center">
                          {item.label}
                        </div>
                        <div className="px-3 py-2 text-sm text-foreground flex-1 border-r border-border last:border-r-0">
                          {item.value}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 비-bordered 레이아웃
  return (
    <div className={cn("", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      )}
      <div
        className="grid gap-x-6 gap-y-3"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {items.map((item) => {
          const span = item.span ?? 1;
          return (
            <div key={item.key} style={{ gridColumn: `span ${span}` }}>
              {layout === "vertical" ? (
                <>
                  <div className="text-xs font-medium text-muted mb-0.5">{item.label}</div>
                  <div className="text-sm text-foreground">{item.value}</div>
                </>
              ) : (
                <div className="flex gap-2">
                  <div className="text-xs font-medium text-muted w-[100px] shrink-0 pt-0.5">{item.label}</div>
                  <div className="text-sm text-foreground flex-1">{item.value}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
