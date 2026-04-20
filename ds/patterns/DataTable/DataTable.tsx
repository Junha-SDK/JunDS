"use client";
import { useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import { Pagination } from "../../composites/Pagination";
import { EmptyState } from "../../composites/EmptyState";
import { Checkbox } from "../../primitives/Checkbox";
import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  /** 셀 렌더 */
  render: (row: T, index: number) => ReactNode;
  /** 정렬 가능 여부 */
  sortable?: boolean;
  /** 컬럼 너비 */
  width?: string;
  /** 고정 컬럼 */
  sticky?: boolean;
  /** 정렬 함수 */
  sortFn?: (a: T, b: T) => number;
  /** 헤더 정렬 */
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** 행 키 추출 */
  rowKey: (row: T) => string;
  /** 선택 모드 */
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  /** 페이지당 행 수 */
  pageSize?: number;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 로딩 */
  loading?: boolean;
  /** 행 클릭 */
  onRowClick?: (row: T) => void;
  /** 스트라이프 */
  striped?: boolean;
  className?: string;
}

type SortState = { key: string; dir: "asc" | "desc" } | null;

/**
 * 데이터 테이블
 * @example
 * <DataTable
 *   columns={[{ key:"name", header:"이름", render:r=>r.name, sortable:true }]}
 *   data={users}
 *   rowKey={r=>r.id}
 *   selectable
 *   pageSize={20}
 * />
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  selectable,
  selectedKeys,
  onSelectionChange,
  pageSize = 20,
  emptyMessage = "데이터가 없습니다",
  loading,
  onRowClick,
  striped,
  className,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(null);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortFn) return data;
    const sorted = [...data].sort(col.sortFn);
    return sort.dir === "desc" ? sorted.reverse() : sorted;
  }, [data, sort, columns]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const allSelected = paged.length > 0 && paged.every((r) => selectedKeys?.has(rowKey(r)));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (allSelected) {
      paged.forEach((r) => next.delete(rowKey(r)));
    } else {
      paged.forEach((r) => next.add(rowKey(r)));
    }
    onSelectionChange(next);
  };

  const toggleRow = (key: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        if (prev.dir === "asc") return { key, dir: "desc" };
        return null;
      }
      return { key, dir: "asc" };
    });
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/80">
              {selectable && (
                <th className="w-10 px-3 py-2.5 border-b border-border">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && (selectedKeys?.size ?? 0) > 0}
                    onChange={toggleAll}
                    size="sm"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider border-b border-border",
                    "whitespace-nowrap",
                    col.sortable && "cursor-pointer hover:text-foreground select-none",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.sticky && "sticky left-0 bg-gray-50/80 z-10",
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sort?.key === col.key && (
                      <svg
                        width="12" height="12" viewBox="0 0 12 12" fill="none"
                        className={cn("transition-transform", sort.dir === "desc" && "rotate-180")}
                      >
                        <path d="M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  {selectable && <td className="px-3 py-3 border-b border-border-light"><div className="w-4 h-4 bg-gray-200 animate-pulse rounded" /></td>}
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-3 border-b border-border-light">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <EmptyState title={emptyMessage} />
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => {
                const key = rowKey(row);
                const isSelected = selectedKeys?.has(key);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer",
                      isSelected && "bg-primary-light/50",
                      striped && idx % 2 === 1 && "bg-gray-50/50",
                      "hover:bg-gray-50",
                    )}
                  >
                    {selectable && (
                      <td className="px-3 py-2 border-b border-border-light" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onChange={() => toggleRow(key)} size="sm" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-3 py-2 text-sm border-b border-border-light",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.sticky && "sticky left-0 bg-white z-10",
                        )}
                      >
                        {col.render(row, idx)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted">
            {sorted.length}개 중 {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)}
          </span>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
