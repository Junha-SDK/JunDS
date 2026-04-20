"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface TableColumn<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T) => ReactNode;
  className?: string;
  /** 텍스트 정렬 */
  align?: "left" | "center" | "right";
}

export interface TableProps<T = any> {
  /** 컬럼 정의 */
  columns: TableColumn<T>[];
  /** 테이블 데이터 */
  data: T[];
  /** 줄무늬 스타일 */
  striped?: boolean;
  /** 호버 효과 */
  hoverable?: boolean;
  /** 콤팩트 모드 */
  compact?: boolean;
  className?: string;
  /** 행 클릭 핸들러 */
  onRowClick?: (row: T, index: number) => void;
  /** 데이터가 없을 때 표시할 메시지 */
  emptyMessage?: string;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * 테이블
 * 간단하고 가벼운 데이터 테이블 컴포넌트
 * @example
 * <Table columns={[{key:"name",header:"이름"}]} data={[{name:"홍길동"}]} striped hoverable />
 */
export function Table<T extends Record<string, any>>({
  columns,
  data,
  striped,
  hoverable,
  compact,
  className,
  onRowClick,
  emptyMessage = "데이터가 없습니다",
}: TableProps<T>) {
  return (
    <div className={cn("overflow-x-auto border border-border rounded-xl", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "font-medium text-muted",
                  compact ? "px-3 py-2" : "px-4 py-3",
                  alignClass[col.align ?? "left"],
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={cn(
                  "border-b border-border last:border-b-0 transition-colors",
                  striped && rowIndex % 2 === 1 && "bg-gray-50/50",
                  hoverable && "hover:bg-gray-50",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "text-foreground",
                      compact ? "px-3 py-1.5" : "px-4 py-3",
                      alignClass[col.align ?? "left"],
                      col.className,
                    )}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
