"use client";
import { useMemo, useState } from "react";
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

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

const headerContentClass = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const;

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
  const safePageSize = Math.max(1, pageSize);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortFn) return data;
    const sorted = [...data].sort(col.sortFn);
    return sort.dir === "desc" ? sorted.reverse() : sorted;
  }, [data, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / safePageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * safePageSize, currentPage * safePageSize);
  const rangeStart = sorted.length === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const rangeEnd = Math.min(currentPage * safePageSize, sorted.length);
  const stickyLeft = selectable ? 48 : 0;

  const getColumnStyle = (col: DataTableColumn<T>) => {
    if (!col.width && !col.sticky) return undefined;
    return {
      width: col.width,
      left: col.sticky ? stickyLeft : undefined,
    };
  };

  const allSelected = paged.length > 0 && paged.every((r) => selectedKeys?.has(rowKey(r)));
  const someSelectedOnPage = paged.some((r) => selectedKeys?.has(rowKey(r)));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys ?? []);
    if (allSelected) {
      paged.forEach((r) => next.delete(rowKey(r)));
    } else {
      paged.forEach((r) => next.add(rowKey(r)));
    }
    onSelectionChange(next);
  };

  const toggleRow = (key: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys ?? []);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  const handleSort = (key: string) => {
    setPage(1);
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
      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm" aria-busy={loading}>
            <colgroup>
              {selectable && <col style={{ width: 48 }} />}
              {columns.map((col) => (
                <col key={col.key} style={col.width ? { width: col.width } : undefined} />
              ))}
            </colgroup>
            <thead className="bg-gray-50/90">
              <tr>
                {selectable && (
                  <th scope="col" className="sticky left-0 z-20 w-12 border-b border-border bg-gray-50/95 px-3 py-3">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelectedOnPage && !allSelected}
                        onChange={toggleAll}
                        size="sm"
                      />
                    </div>
                  </th>
                )}
                {columns.map((col) => {
                  const align = col.align ?? "left";
                  const sortedByColumn = sort?.key === col.key;

                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={col.sortable ? (sortedByColumn ? (sort.dir === "asc" ? "ascending" : "descending") : "none") : undefined}
                      className={cn(
                        "border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted",
                        "whitespace-nowrap",
                        alignClass[align],
                        col.sticky && "sticky z-10 bg-gray-50/95",
                      )}
                      style={getColumnStyle(col)}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className={cn(
                            "inline-flex w-full items-center gap-1.5 rounded-md text-inherit transition-colors",
                            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                            headerContentClass[align],
                          )}
                        >
                          <span>{col.header}</span>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center text-muted-light transition-all",
                              sortedByColumn ? "opacity-100 text-primary" : "opacity-35",
                              sortedByColumn && sort.dir === "desc" && "rotate-180",
                            )}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M3 7l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </button>
                      ) : (
                        <span className={cn("flex w-full items-center", headerContentClass[align])}>{col.header}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    {selectable && (
                      <td className="sticky left-0 z-20 w-12 border-b border-border-light bg-white px-3 py-3">
                        <div className="mx-auto h-3.5 w-3.5 animate-pulse rounded bg-gray-200" />
                      </td>
                    )}
                    {columns.map((col) => {
                      const align = col.align ?? "left";

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "border-b border-border-light px-4 py-3",
                            alignClass[align],
                            col.sticky && "sticky z-10 bg-white",
                          )}
                          style={getColumnStyle(col)}
                        >
                          <div
                            className={cn(
                              "h-4 w-3/4 animate-pulse rounded bg-gray-200",
                              align === "center" && "mx-auto",
                              align === "right" && "ml-auto",
                            )}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)}>
                    <EmptyState title={emptyMessage} className="py-14" />
                  </td>
                </tr>
              ) : (
                paged.map((row, idx) => {
                  const key = rowKey(row);
                  const isSelected = selectedKeys?.has(key);
                  const isStriped = striped && idx % 2 === 1;

                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        "group transition-colors hover:bg-gray-50/90",
                        onRowClick && "cursor-pointer",
                        isStriped && "bg-gray-50/45",
                        isSelected && "bg-primary-light/50",
                      )}
                    >
                      {selectable && (
                        <td
                          className={cn(
                            "sticky left-0 z-20 w-12 border-b border-border-light px-3 py-3",
                            "bg-white group-hover:bg-gray-50/95",
                            isStriped && "bg-gray-50/95",
                            isSelected && "bg-primary-light/90",
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center">
                            <Checkbox checked={isSelected} onChange={() => toggleRow(key)} size="sm" />
                          </div>
                        </td>
                      )}
                      {columns.map((col) => {
                        const align = col.align ?? "left";

                        return (
                          <td
                            key={col.key}
                            className={cn(
                              "border-b border-border-light px-4 py-3 text-foreground",
                              alignClass[align],
                              col.sticky && [
                                "sticky z-10 bg-white group-hover:bg-gray-50/95",
                                isStriped && "bg-gray-50/95",
                                isSelected && "bg-primary-light/90",
                              ],
                            )}
                            style={getColumnStyle(col)}
                          >
                            {col.render(row, idx)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && sorted.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border bg-gray-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-muted" aria-live="polite">
              <span className="font-medium text-foreground">
                {rangeStart}–{rangeEnd}
              </span>
              <span> / 총 {sorted.length}개</span>
            </span>
            {totalPages > 1 && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={setPage}
                className="justify-end"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
