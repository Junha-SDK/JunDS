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
  /** 키-값 항목 목록 */
  items: DescriptionItem[];
  /** 상단 제목 */
  title?: string;
  /** 한 행에 표시할 컬럼 수 */
  columns?: number;
  /** 테두리 표시 여부 */
  bordered?: boolean;
  /** 라벨/값 레이아웃 방향 */
  layout?: "horizontal" | "vertical";
  /** 추가 클래스 */
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
 * @status stable
 * @since 2.2.0
 * @tags data-display
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
      <div className={cn("border border-border rounded-xl overflow-hidden", className)}>
        {title && (
          // bg-gray-50 은 라이트 전용 값 — 다크에서 헤더 줄만 밝게 뜬다.
          <div className="px-4 py-3 bg-surface-soft border-b border-border">
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
                      <td
                        key={item.key}
                        colSpan={span}
                        className="border-r border-border last:border-r-0 p-0"
                      >
                        <div className="px-3 py-1.5 bg-surface-soft text-xs font-medium text-muted border-b border-border">
                          {item.label}
                        </div>
                        <div className="px-3 py-2 text-sm text-foreground">{item.value}</div>
                      </td>
                    );
                  }
                  return (
                    <td key={item.key} colSpan={span * 2} className="p-0">
                      <div className="flex">
                        <div className="px-3 py-2 bg-surface-soft text-xs font-medium text-muted w-[120px] shrink-0 border-r border-border flex items-center">
                          {item.label}
                        </div>
                        {/* 값이 긴 문자열이면 flex 자식은 min-w-0 없이 넘친다 */}
                        <div className="px-3 py-2 text-sm text-foreground flex-1 min-w-0 border-r border-border last:border-r-0">
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
      {title && <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>}
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
                  <div className="text-xs font-medium text-muted w-[100px] shrink-0 pt-0.5">
                    {item.label}
                  </div>
                  <div className="text-sm text-foreground flex-1 min-w-0">{item.value}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
