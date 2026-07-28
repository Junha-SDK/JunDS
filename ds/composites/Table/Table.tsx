"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface TableColumn<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T) => ReactNode;
  /** 추가 클래스 */
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
  /** 행 크기 */
  size?: "sm" | "md" | "lg";
  /** 헤더 고정 (스크롤 시 상단에 고정) */
  stickyHeader?: boolean;
  /** 테이블 최대 높이 (stickyHeader와 함께 사용) */
  maxHeight?: string | number;
  /** 셀 테두리 표시 */
  bordered?: boolean;
  /** 추가 클래스 */
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

const sizePadding = {
  sm: { th: "px-3 py-2", td: "px-3 py-1.5" },
  md: { th: "px-4 py-3", td: "px-4 py-3" },
  lg: { th: "px-5 py-4", td: "px-5 py-4" },
} as const;

/**
 * 테이블
 * 간단하고 가벼운 데이터 테이블 컴포넌트
 * @example
 * <Table columns={[{key:"name",header:"이름"}]} data={[{name:"홍길동"}]} striped hoverable />
 */
function TableInner<T extends Record<string, any>>({
  columns,
  data,
  striped,
  hoverable,
  compact,
  size,
  stickyHeader,
  maxHeight,
  bordered,
  className,
  onRowClick,
  emptyMessage = "데이터가 없습니다",
  innerRef,
}: TableProps<T> & { innerRef?: React.Ref<HTMLDivElement> }) {
  // size prop takes precedence; fall back to compact for backward compat
  const resolvedSize = size ?? (compact ? "sm" : "md");
  const { th: thPad, td: tdPad } = sizePadding[resolvedSize];

  const wrapperStyle: React.CSSProperties | undefined =
    stickyHeader && maxHeight
      ? {
          maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
          overflowY: "auto",
        }
      : undefined;

  return (
    <div
      ref={innerRef}
      className={cn(
        "overflow-x-auto overscroll-x-contain border border-border rounded-xl bg-card shadow-xs",
        className,
      )}
      style={wrapperStyle}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-soft">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "font-medium text-muted whitespace-nowrap",
                  thPad,
                  alignClass[col.align ?? "left"],
                  // 고정 헤더는 스크롤되는 행 위로 떠 있어야 한다 — 배경 + 아래쪽 그림자
                  stickyHeader &&
                    "sticky top-0 z-[2] bg-surface-soft shadow-[0_1px_0_var(--border)]",
                  bordered && "border border-border",
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
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
                // 클릭 가능한 행은 키보드로도 닿아야 focus-visible 이 의미를 갖는다
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row, rowIndex);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "border-b border-border last:border-b-0 transition-colors",
                  striped && rowIndex % 2 === 1 && "bg-surface-soft/60",
                  hoverable && "hover:bg-surface-soft",
                  onRowClick &&
                    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/55",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "text-foreground",
                      tdPad,
                      alignClass[col.align ?? "left"],
                      bordered && "border border-border",
                      col.className,
                    )}
                  >
                    {col.render ? col.render(row[col.key], row) : (row[col.key] as ReactNode)}
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

/**
 * 컬럼 정의 + 데이터 행으로 구성된 기본 테이블.
 * @example
 * <Table columns={columns} data={rows} striped hoverable />
 * @status stable
 * @since 2.2.0
 * @tags data
 */
export function Table<T extends Record<string, any>>(
  props: TableProps<T> & { ref?: React.Ref<HTMLDivElement> },
) {
  return <TableInner {...props} innerRef={props.ref} />;
}

Table.displayName = "Table";
