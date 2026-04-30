"use client";
import { useState, useMemo } from "react";
import { cn } from "../../utils/cn";

export interface DataGridColumn<T> {
  key: string;
  header: string;
  width?: number;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataGridProps<T> {
  /** 표 행 데이터 */
  data: T[];
  /** 열 정의 */
  columns: DataGridColumn<T>[];
  /** 페이지당 행 수 */
  pageSize?: number;
  /** 행 선택 가능 여부 */
  selectable?: boolean;
  /** 선택 변경 콜백 */
  onSelect?: (selected: T[]) => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 페이징·선택이 지원되는 데이터 그리드.
 * @example
 * <DataGrid data={rows} columns={cols} pageSize={20} selectable onSelect={setSelected} />
 * @status stable
 * @since 2.2.0
 * @tags data
 */
export function DataGrid<T extends Record<string, unknown>>({
  data, columns, pageSize = 20, selectable, onSelect, className,
}: DataGridProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleSelect = (idx: number) => {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setSelected(next);
    onSelect?.(Array.from(next).map((i) => sorted[i]));
  };

  const toggleAll = () => {
    if (selected.size === paged.length) { setSelected(new Set()); onSelect?.([]); }
    else {
      const all = new Set(paged.map((_, i) => page * pageSize + i));
      setSelected(all);
      onSelect?.(paged);
    }
  };

  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              {selectable && (
                <th className="w-10 px-3 py-2.5">
                  <input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} className="cursor-pointer" />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={cn("px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wider", col.sortable && "cursor-pointer hover:text-foreground select-none")}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <svg width="10" height="10" viewBox="0 0 10 10"><path d={sortDir === "asc" ? "M2 6l3-3 3 3" : "M2 4l3 3 3-3"} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, ri) => {
              const globalIdx = page * pageSize + ri;
              return (
                <tr key={ri} className={cn("border-b border-border last:border-0 transition-colors", selected.has(globalIdx) ? "bg-primary/5" : "hover:bg-gray-50")}>
                  {selectable && (
                    <td className="px-3 py-2">
                      <input type="checkbox" checked={selected.has(globalIdx)} onChange={() => toggleSelect(globalIdx)} className="cursor-pointer" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2">
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-border text-xs text-muted">
          <span>{data.length}개 중 {page * pageSize + 1}-{Math.min((page + 1) * pageSize, data.length)}</span>
          <div className="flex gap-1">
            <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 cursor-pointer">이전</button>
            <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 cursor-pointer">다음</button>
          </div>
        </div>
      )}
    </div>
  );
}
