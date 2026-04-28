"use client";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";
import { Pagination } from "../../composites/Pagination";
import { EmptyState } from "../../composites/EmptyState";
import { Checkbox } from "../../primitives/Checkbox";
import type { ReactNode } from "react";
import { SearchIcon, ChevronIcon, DownloadIcon, FullscreenIcon, ColumnsIcon, DensityIcon, FilterIcon, PinIcon, CopyIcon } from "./DataTableIcons";
import { exportCSV, exportJSON, ToolbarBtn, ColumnFilter, ColumnResizer } from "./DataTableUtils";

/* ─────────────────────────── Types ─────────────────────────── */

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  sortFn?: (a: T, b: T) => number;
  filterFn?: (row: T, filterValue: string) => boolean;
  width?: string;
  minWidth?: number;
  sticky?: boolean;
  align?: "left" | "center" | "right";
  /** 컬럼 그룹 헤더 */
  group?: string;
  /** 행 요약/집계 함수 */
  aggregate?: (data: T[]) => ReactNode;
  /** 인라인 편집 가능 */
  editable?: boolean;
  /** 인라인 편집 시 값 저장 */
  onEdit?: (row: T, value: string) => void;
  /** 기본 숨김 */
  hidden?: boolean;
  /** 리사이즈 가능 */
  resizable?: boolean;
}

export type DensityMode = "compact" | "normal" | "comfortable";

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  /* ── 선택 ── */
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  /* ── 페이지네이션 ── */
  pageSize?: number;
  pageSizeOptions?: number[];
  /* ── 확장 행 ── */
  expandable?: boolean;
  expandedRowRender?: (row: T) => ReactNode;
  /* ── 검색/필터 ── */
  searchable?: boolean;
  searchPlaceholder?: string;
  /* ── 내보내기 ── */
  exportable?: boolean;
  exportFilename?: string;
  /* ── 벌크 액션 ── */
  bulkActions?: { label: string; icon?: ReactNode; onClick: (keys: Set<string>) => void; variant?: "danger" | "default" }[];
  /* ── 밀도 ── */
  density?: DensityMode;
  densityToggle?: boolean;
  /* ── 풀스크린 ── */
  fullscreenToggle?: boolean;
  /* ── 컬럼 토글 ── */
  columnToggle?: boolean;
  /* ── 행 요약 ── */
  showSummary?: boolean;
  /* ── 가상 스크롤 ── */
  virtualScroll?: boolean;
  virtualRowHeight?: number;
  /* ── 행 번호 ── */
  showRowNumbers?: boolean;
  /* ── 행 드래그 정렬 ── */
  draggableRows?: boolean;
  onRowReorder?: (fromIndex: number, toIndex: number) => void;
  /* ── 행 고정 (상단 pin) ── */
  pinnableRows?: boolean;
  pinnedKeys?: Set<string>;
  onPinnedChange?: (keys: Set<string>) => void;
  /* ── 행 컨텍스트 메뉴 ── */
  contextMenu?: (row: T) => { label: string; onClick: () => void; danger?: boolean }[];
  /* ── 조건부 서식 ── */
  rowClassName?: (row: T, index: number) => string | undefined;
  cellClassName?: (row: T, column: DataTableColumn<T>) => string | undefined;
  /* ── 서버사이드 모드 ── */
  serverSide?: boolean;
  totalRows?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  onSortChange?: (sorts: SortState[]) => void;
  onFilterChange?: (search: string, columnFilters: Record<string, string>) => void;
  /* ── 행 그룹핑 ── */
  groupBy?: string;
  /* ── 셀 복사 ── */
  copyable?: boolean;
  /* ── 기타 ── */
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  striped?: boolean;
  stickyHeader?: boolean;
  caption?: string;
  className?: string;
}

export type SortState = { key: string; dir: "asc" | "desc" };

/* ─────────────────────────── Constants ─────────────────────────── */

const alignClass = { left: "text-left", center: "text-center", right: "text-right" } as const;
const headerContentClass = { left: "justify-start", center: "justify-center", right: "justify-end" } as const;

const densityPadding: Record<DensityMode, string> = {
  compact: "px-3 py-1.5",
  normal: "px-4 py-3",
  comfortable: "px-5 py-4",
};

const densityText: Record<DensityMode, string> = {
  compact: "text-xs",
  normal: "text-sm",
  comfortable: "text-sm",
};


/* ─────────────────────────── Main Component ─────────────────────────── */

/**
 * 고급 데이터 테이블
 *
 * 기능: 글로벌 검색, 컬럼별 필터, 멀티소트, 확장 가능 행, 컬럼 리사이즈,
 * 컬럼 숨기기/보이기, 컬럼 고정, CSV/JSON 내보내기, 벌크 액션, 밀도 조절,
 * 풀스크린, 인라인 편집, 컬럼 그룹핑, 행 요약/집계, 키보드 네비게이션,
 * 가상 스크롤
 */
export function DataTable<T>({
  columns: initialColumns,
  data,
  rowKey,
  selectable,
  selectedKeys,
  onSelectionChange,
  pageSize: initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  expandable,
  expandedRowRender,
  searchable = false,
  searchPlaceholder = "테이블 검색...",
  exportable = false,
  exportFilename = "data",
  bulkActions,
  density: initialDensity = "normal",
  densityToggle = false,
  fullscreenToggle = false,
  columnToggle = false,
  showSummary = false,
  virtualScroll = false,
  virtualRowHeight = 44,
  showRowNumbers = false,
  draggableRows = false,
  onRowReorder,
  pinnableRows = false,
  pinnedKeys: pinnedKeysProp,
  onPinnedChange,
  contextMenu,
  rowClassName,
  cellClassName,
  serverSide = false,
  totalRows,
  onPageChange,
  onSortChange,
  onFilterChange,
  groupBy,
  copyable = false,
  emptyMessage = "데이터가 없습니다",
  loading,
  onRowClick,
  striped,
  stickyHeader = false,
  caption,
  className,
}: DataTableProps<T>) {
  /* ── State ── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sorts, setSorts] = useState<SortState[]>([]);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(() =>
    new Set(initialColumns.filter((c) => c.hidden).map((c) => c.key)),
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [density, setDensity] = useState<DensityMode>(initialDensity);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [editingCell, setEditingCell] = useState<{ rowKey: string; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showDensityMenu, setShowDensityMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [focusedRow, setFocusedRow] = useState<number>(-1);
  const [contextMenuState, setContextMenuState] = useState<{ x: number; y: number; row: T } | null>(null);
  const [dragRowIndex, setDragRowIndex] = useState<number | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const densityMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  /* ── Visible columns ── */
  const columns = useMemo(
    () => initialColumns.filter((c) => !hiddenKeys.has(c.key)),
    [initialColumns, hiddenKeys],
  );

  /* ── Column groups ── */
  const hasGroups = columns.some((c) => c.group);
  const groups = useMemo(() => {
    if (!hasGroups) return null;
    const result: { name: string; span: number }[] = [];
    let current = "";
    let span = 0;
    columns.forEach((col) => {
      const g = col.group ?? "";
      if (g !== current) {
        if (span > 0) result.push({ name: current, span });
        current = g;
        span = 1;
      } else {
        span++;
      }
    });
    if (span > 0) result.push({ name: current, span });
    return result;
  }, [columns, hasGroups]);

  /* ── Close menus on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) setShowColumnMenu(false);
      if (densityMenuRef.current && !densityMenuRef.current.contains(e.target as Node)) setShowDensityMenu(false);
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Fullscreen ── */
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFullscreen(false); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [isFullscreen]);

  /* ── Context menu close ── */
  useEffect(() => {
    if (!contextMenuState) return;
    const handler = (e: MouseEvent) => setContextMenuState(null);
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") setContextMenuState(null); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler); };
  }, [contextMenuState]);

  /* ── Pinned keys (internal) ── */
  const pinnedKeys = pinnedKeysProp ?? new Set<string>();
  const togglePin = useCallback((key: string) => {
    const next = new Set(pinnedKeys);
    if (next.has(key)) next.delete(key); else next.add(key);
    onPinnedChange?.(next);
  }, [pinnedKeys, onPinnedChange]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    if (serverSide) return data;
    let result = data;

    // Global search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const node = col.render(row, 0);
          const text = typeof node === "string" || typeof node === "number" ? String(node).toLowerCase() : "";
          return text.includes(q);
        }),
      );
    }

    // Per-column filters
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v);
    if (activeFilters.length > 0) {
      result = result.filter((row) =>
        activeFilters.every(([key, filterVal]) => {
          const col = columns.find((c) => c.key === key);
          if (!col) return true;
          if (col.filterFn) return col.filterFn(row, filterVal);
          const node = col.render(row, 0);
          const text = typeof node === "string" || typeof node === "number" ? String(node).toLowerCase() : "";
          return text.includes(filterVal.toLowerCase());
        }),
      );
    }

    return result;
  }, [data, search, columnFilters, columns, serverSide]);

  /* ── Multi-sort ── */
  const sorted = useMemo(() => {
    if (serverSide) return filtered;
    if (sorts.length === 0) return filtered;
    return [...filtered].sort((a, b) => {
      for (const s of sorts) {
        const col = columns.find((c) => c.key === s.key);
        if (!col?.sortFn) continue;
        const cmp = col.sortFn(a, b);
        if (cmp !== 0) return s.dir === "desc" ? -cmp : cmp;
      }
      return 0;
    });
  }, [filtered, sorts, columns, serverSide]);

  /* ── Row pinning: separate pinned from unpinned ── */
  const { pinnedRows, unpinnedRows, displayRows } = useMemo(() => {
    if (!pinnableRows || pinnedKeys.size === 0) return { pinnedRows: [] as T[], unpinnedRows: sorted, displayRows: sorted };
    const pinned: T[] = [];
    const unpinned: T[] = [];
    sorted.forEach((row) => {
      if (pinnedKeys.has(rowKey(row))) pinned.push(row);
      else unpinned.push(row);
    });
    return { pinnedRows: pinned, unpinnedRows: unpinned, displayRows: [...pinned, ...unpinned] };
  }, [sorted, pinnableRows, pinnedKeys, rowKey]);

  /* ── Pagination ── */
  const safePageSize = Math.max(1, pageSize);
  const serverTotal = serverSide && totalRows != null ? totalRows : displayRows.length;
  const totalPages = Math.max(1, Math.ceil(serverTotal / safePageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = serverSide ? displayRows : virtualScroll ? displayRows : displayRows.slice((currentPage - 1) * safePageSize, currentPage * safePageSize);
  const rangeStart = serverTotal === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const rangeEnd = Math.min(currentPage * safePageSize, serverTotal);

  /* ── Virtual scroll ── */
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const virtualStartIdx = virtualScroll ? Math.max(0, Math.floor(scrollTop / virtualRowHeight) - 5) : 0;
  const virtualEndIdx = virtualScroll ? Math.min(displayRows.length, Math.ceil((scrollTop + containerHeight) / virtualRowHeight) + 5) : paged.length;
  const virtualPaged = virtualScroll ? displayRows.slice(virtualStartIdx, virtualEndIdx) : paged;

  /* ── Sticky left offset ── */
  const dragColWidth = draggableRows ? 40 : 0;
  const rowNumColWidth = showRowNumbers ? 48 : 0;
  const checkColWidth = selectable ? 48 : 0;
  const expandColWidth = expandable ? 40 : 0;
  const stickyLeft = dragColWidth + rowNumColWidth + checkColWidth + (expandable ? expandColWidth : 0);
  const leftOffset = dragColWidth + rowNumColWidth + checkColWidth + expandColWidth;

  /* ── Column width ── */
  const getColumnStyle = (col: DataTableColumn<T>) => {
    const w = columnWidths[col.key] ?? (col.width ? undefined : undefined);
    return {
      width: w ? `${w}px` : col.width,
      minWidth: col.minWidth,
      left: col.sticky ? leftOffset : undefined,
    };
  };

  /* ── Selection ── */
  const visibleRows = virtualScroll ? displayRows : paged;
  const allSelected = visibleRows.length > 0 && visibleRows.every((r) => selectedKeys?.has(rowKey(r)));
  const someSelected = visibleRows.some((r) => selectedKeys?.has(rowKey(r)));
  const selectedCount = selectedKeys?.size ?? 0;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys ?? []);
    if (allSelected) visibleRows.forEach((r) => next.delete(rowKey(r)));
    else visibleRows.forEach((r) => next.add(rowKey(r)));
    onSelectionChange(next);
  };

  const toggleRow = (key: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys ?? []);
    if (next.has(key)) next.delete(key); else next.add(key);
    onSelectionChange(next);
  };

  /* ── Sort ── */
  const handleSort = useCallback((key: string, multi: boolean) => {
    setPage(1);
    setSorts((prev) => {
      const existing = prev.find((s) => s.key === key);
      let next: SortState[];
      if (existing) {
        if (existing.dir === "asc") {
          next = prev.map((s) => s.key === key ? { ...s, dir: "desc" as const } : s);
        } else {
          next = prev.filter((s) => s.key !== key);
        }
      } else {
        const newSort: SortState = { key, dir: "asc" };
        next = multi ? [...prev, newSort] : [newSort];
      }
      if (serverSide) onSortChange?.(next);
      return next;
    });
  }, [serverSide, onSortChange]);

  /* ── Expand ── */
  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  /* ── Column resize ── */
  const handleResize = useCallback((colKey: string, delta: number) => {
    setColumnWidths((prev) => {
      const current = prev[colKey] ?? 150;
      return { ...prev, [colKey]: Math.max(60, current + delta) };
    });
  }, []);

  /* ── Inline edit ── */
  const startEdit = (rKey: string, cKey: string, currentValue: string) => {
    setEditingCell({ rowKey: rKey, colKey: cKey });
    setEditValue(currentValue);
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const col = columns.find((c) => c.key === editingCell.colKey);
    const row = data.find((r) => rowKey(r) === editingCell.rowKey);
    if (col?.onEdit && row) col.onEdit(row, editValue);
    setEditingCell(null);
  };

  /* ── Keyboard navigation ── */
  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedRow((prev) => Math.min(prev + 1, virtualPaged.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedRow((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && focusedRow >= 0 && virtualPaged[focusedRow]) {
      onRowClick?.(virtualPaged[focusedRow]);
    } else if (e.key === " " && selectable && focusedRow >= 0 && virtualPaged[focusedRow]) {
      e.preventDefault();
      toggleRow(rowKey(virtualPaged[focusedRow]));
    }
  };

  /* ── Active filter count ── */
  const activeFilterCount = Object.values(columnFilters).filter(Boolean).length + (search ? 1 : 0);

  /* ── Column filter handler ── */
  const setColumnFilter = (key: string, value: string) => {
    const next = { ...columnFilters, [key]: value };
    setColumnFilters(next);
    setPage(1);
    if (serverSide) onFilterChange?.(search, next);
  };

  /* ── Server-side search wrapper ── */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (serverSide) onFilterChange?.(value, columnFilters);
  };

  /* ── Server-side page change ── */
  const handlePageChange = (p: number) => {
    setPage(p);
    if (serverSide) onPageChange?.(p, pageSize);
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
    if (serverSide) onPageChange?.(1, size);
  };

  /* ── Copy cell to clipboard ── */
  const copyToClipboard = useCallback((text: string, cellId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCell(cellId);
      setTimeout(() => setCopiedCell(null), 1500);
    });
  }, []);

  /* ── Row grouping ── */
  const groupedRows = useMemo(() => {
    if (!groupBy) return null;
    const groups: { key: string; rows: T[] }[] = [];
    const map = new Map<string, T[]>();
    const rowsToGroup = virtualScroll ? displayRows : paged;
    rowsToGroup.forEach((row) => {
      const col = columns.find((c) => c.key === groupBy);
      const node = col?.render(row, 0);
      const groupKey = typeof node === "string" || typeof node === "number" ? String(node) : "기타";
      if (!map.has(groupKey)) {
        map.set(groupKey, []);
        groups.push({ key: groupKey, rows: map.get(groupKey)! });
      }
      map.get(groupKey)!.push(row);
    });
    return groups;
  }, [groupBy, displayRows, paged, virtualScroll, columns]);

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey); else next.add(groupKey);
      return next;
    });
  };

  /* ── Render row helper ── */
  const renderRow = (row: T, key: string, globalIdx: number, localIdx: number, isPinned: boolean, isSelected: boolean | undefined, isStriped: boolean | undefined, isExpanded: boolean, isFocused: boolean, customRowClass?: string): React.ReactNode[] => {
    const pad = densityPadding[density];
    return [
      <tr
        key={key}
        onClick={() => onRowClick?.(row)}
        onContextMenu={(e) => {
          if (!contextMenu) return;
          e.preventDefault();
          setContextMenuState({ x: e.clientX, y: e.clientY, row });
        }}
        data-row-index={globalIdx}
        draggable={draggableRows}
        onDragStart={draggableRows ? (e) => {
          setDragRowIndex(globalIdx);
          e.dataTransfer.effectAllowed = "move";
        } : undefined}
        onDragOver={draggableRows ? (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        } : undefined}
        onDrop={draggableRows ? (e) => {
          e.preventDefault();
          if (dragRowIndex !== null && dragRowIndex !== globalIdx) {
            onRowReorder?.(dragRowIndex, globalIdx);
          }
          setDragRowIndex(null);
        } : undefined}
        onDragEnd={draggableRows ? () => setDragRowIndex(null) : undefined}
        className={cn(
          "group transition-colors",
          onRowClick && "cursor-pointer",
          "hover:bg-gray-50/90",
          isStriped && "bg-gray-50/45",
          isSelected && "bg-primary-light/50 hover:bg-primary-light/70",
          isFocused && "ring-2 ring-inset ring-primary/30",
          isPinned && "bg-amber-50/60 hover:bg-amber-50/80",
          dragRowIndex === globalIdx && "opacity-50",
          customRowClass,
        )}
      >
        {draggableRows && (
          <td className={cn("w-10 border-b border-border-light bg-white group-hover:bg-gray-50/95 cursor-grab", pad)} onClick={(e) => e.stopPropagation()}>
            <span className="text-muted-light text-sm select-none" aria-label="드래그 핸들">⠿</span>
          </td>
        )}
        {showRowNumbers && (
          <td className={cn("w-12 border-b border-border-light bg-white group-hover:bg-gray-50/95 text-center text-muted-light", pad)}>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xs">{globalIdx + 1}</span>
              {pinnableRows && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); togglePin(key); }}
                  className={cn("p-0.5 rounded transition-colors cursor-pointer", isPinned ? "text-amber-500" : "text-transparent group-hover:text-muted-light hover:text-muted")}
                  aria-label={isPinned ? "고정 해제" : "행 고정"}
                  title={isPinned ? "고정 해제" : "행 고정"}
                >
                  <PinIcon active={isPinned} />
                </button>
              )}
            </div>
          </td>
        )}
        {selectable && (
          <td
            className={cn(
              "sticky left-0 z-20 w-12 border-b border-border-light",
              pad,
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
        {expandable && (
          <td
            className={cn("w-10 border-b border-border-light", pad, "bg-white group-hover:bg-gray-50/95")}
            onClick={(e) => { e.stopPropagation(); toggleExpand(key); }}
          >
            <button type="button" className={cn("p-1 rounded transition-transform cursor-pointer", isExpanded && "rotate-90")} aria-label="행 확장" aria-expanded={isExpanded}>
              <ChevronIcon dir="right" className="text-muted" />
            </button>
          </td>
        )}
        {columns.map((col) => {
          const align = col.align ?? "left";
          const isEditing = editingCell?.rowKey === key && editingCell?.colKey === col.key;
          const cellId = `${key}-${col.key}`;
          const customCellClass = cellClassName?.(row, col);
          const node = col.render(row, globalIdx);
          const cellText = typeof node === "string" || typeof node === "number" ? String(node) : "";

          return (
            <td
              key={col.key}
              className={cn(
                "border-b border-border-light text-foreground relative",
                pad,
                alignClass[align],
                col.sticky && [
                  "sticky z-10 bg-white group-hover:bg-gray-50/95",
                  isStriped && "bg-gray-50/95",
                  isSelected && "bg-primary-light/90",
                ],
                customCellClass,
              )}
              style={getColumnStyle(col)}
              onDoubleClick={() => {
                if (!col.editable || !col.onEdit) return;
                startEdit(key, col.key, cellText);
              }}
            >
              {isEditing ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingCell(null); }}
                  className="w-full h-7 px-1.5 text-sm border border-primary rounded outline-none bg-white"
                />
              ) : (
                <div className="flex items-center gap-1">
                  <span className="flex-1">{node}</span>
                  {copyable && cellText && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(cellText, cellId); }}
                      className={cn(
                        "shrink-0 p-0.5 rounded transition-all cursor-pointer",
                        copiedCell === cellId ? "text-green-500" : "text-transparent group-hover:text-muted-light hover:text-muted",
                      )}
                      aria-label="셀 복사"
                      title="클립보드에 복사"
                    >
                      {copiedCell === cellId ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5L5 9l4.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : (
                        <CopyIcon />
                      )}
                    </button>
                  )}
                </div>
              )}
            </td>
          );
        })}
      </tr>,
      /* Expanded row */
      isExpanded && expandable && expandedRowRender && (
        <tr key={`${key}-expanded`} className="bg-gray-50/30">
          <td colSpan={colSpan} className="px-4 py-4 border-b border-border-light">
            {expandedRowRender(row)}
          </td>
        </tr>
      ),
    ];
  };

  /* ── Render ── */
  const colSpan = columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (showRowNumbers ? 1 : 0) + (draggableRows ? 1 : 0);
  const pad = densityPadding[density];
  const textSize = densityText[density];

  const hasToolbar = searchable || exportable || densityToggle || fullscreenToggle || columnToggle || (selectable && bulkActions && selectedCount > 0);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full",
        isFullscreen && "fixed inset-0 z-50 bg-white flex flex-col",
        className,
      )}
    >
      {/* ── Toolbar ── */}
      {hasToolbar && (
        <div className={cn(
          "flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border bg-white",
          isFullscreen && "border-t-0",
        )}>
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"><SearchIcon /></span>
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-8 pl-8 pr-8 text-xs border border-border rounded-lg outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-glow)] bg-white transition-all"
              />
              {search && (
                <button type="button" onClick={() => handleSearchChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer" aria-label="검색어 지우기">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              )}
            </div>
          )}

          {/* Active filter indicator */}
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-semibold">
              <FilterIcon /> {activeFilterCount}개 필터 활성
              <button type="button" onClick={() => { setSearch(""); setColumnFilters({}); setPage(1); }} className="ml-1 hover:text-danger cursor-pointer" aria-label="모든 필터 초기화">✕</button>
            </span>
          )}

          {/* Bulk actions */}
          {selectable && bulkActions && selectedCount > 0 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-xs text-muted font-medium">{selectedCount}개 선택</span>
              {bulkActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => action.onClick(selectedKeys ?? new Set())}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                    action.variant === "danger"
                      ? "text-danger hover:bg-danger/10"
                      : "text-foreground hover:bg-gray-100",
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-0.5 ml-auto">
            {/* Column toggle */}
            {columnToggle && (
              <div className="relative" ref={columnMenuRef}>
                <ToolbarBtn onClick={() => setShowColumnMenu(!showColumnMenu)} active={showColumnMenu} title="컬럼 설정">
                  <ColumnsIcon /> 컬럼
                </ToolbarBtn>
                {showColumnMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in-scale">
                    {initialColumns.map((col) => (
                      <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!hiddenKeys.has(col.key)}
                          onChange={() => {
                            setHiddenKeys((prev) => {
                              const next = new Set(prev);
                              if (next.has(col.key)) next.delete(col.key); else next.add(col.key);
                              return next;
                            });
                          }}
                          className="rounded cursor-pointer"
                        />
                        {col.header}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Density toggle */}
            {densityToggle && (
              <div className="relative" ref={densityMenuRef}>
                <ToolbarBtn onClick={() => setShowDensityMenu(!showDensityMenu)} active={showDensityMenu} title="행 밀도">
                  <DensityIcon />
                </ToolbarBtn>
                {showDensityMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in-scale">
                    {(["compact", "normal", "comfortable"] as const).map((d) => (
                      <button key={d} type="button" onClick={() => { setDensity(d); setShowDensityMenu(false); }}
                        className={cn("w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50", density === d && "text-primary font-semibold")}>
                        {{ compact: "좁게", normal: "보통", comfortable: "넓게" }[d]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Export */}
            {exportable && (
              <div className="relative" ref={exportMenuRef}>
                <ToolbarBtn onClick={() => setShowExportMenu(!showExportMenu)} title="내보내기">
                  <DownloadIcon /> 내보내기
                </ToolbarBtn>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in-scale">
                    <button type="button" onClick={() => { exportCSV(columns, sorted, exportFilename); setShowExportMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50">CSV 다운로드</button>
                    <button type="button" onClick={() => { exportJSON(sorted, exportFilename); setShowExportMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50">JSON 다운로드</button>
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            {fullscreenToggle && (
              <ToolbarBtn onClick={() => setIsFullscreen(!isFullscreen)} active={isFullscreen} title={isFullscreen ? "풀스크린 종료" : "풀스크린"}>
                <FullscreenIcon active={isFullscreen} />
              </ToolbarBtn>
            )}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className={cn(
        "overflow-hidden rounded-lg border border-border bg-white shadow-sm",
        hasToolbar && "border-t-0 rounded-t-none",
        isFullscreen && "flex-1 rounded-none border-0 shadow-none",
      )}>
        <div
          className={cn("overflow-x-auto", isFullscreen && "h-full overflow-y-auto", virtualScroll && "overflow-y-auto")}
          style={virtualScroll ? { maxHeight: isFullscreen ? undefined : 600 } : undefined}
          onScroll={virtualScroll ? (e) => {
            setScrollTop((e.target as HTMLDivElement).scrollTop);
            setContainerHeight((e.target as HTMLDivElement).clientHeight);
          } : undefined}
          onKeyDown={handleTableKeyDown}
          tabIndex={0}
          role="grid"
        >
          <table className={cn("min-w-full border-separate border-spacing-0", textSize)} aria-busy={loading}>
            {caption && <caption className="sr-only">{caption}</caption>}
            <colgroup>
              {draggableRows && <col style={{ width: 40 }} />}
              {showRowNumbers && <col style={{ width: 48 }} />}
              {selectable && <col style={{ width: 48 }} />}
              {expandable && <col style={{ width: 40 }} />}
              {columns.map((col) => (
                <col key={col.key} style={col.width ? { width: col.width } : columnWidths[col.key] ? { width: columnWidths[col.key] } : undefined} />
              ))}
            </colgroup>

            <thead className={cn("bg-gray-50/90", stickyHeader && "sticky top-0 z-30")}>
              {/* Column group headers */}
              {hasGroups && groups && (
                <tr>
                  {draggableRows && <th className="border-b border-border bg-gray-50/95" />}
                  {showRowNumbers && <th className="border-b border-border bg-gray-50/95" />}
                  {selectable && <th className="border-b border-border bg-gray-50/95" />}
                  {expandable && <th className="border-b border-border bg-gray-50/95" />}
                  {groups.map((g, i) => (
                    <th
                      key={i}
                      colSpan={g.span}
                      className="border-b border-border bg-gray-50/95 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-light text-center"
                    >
                      {g.name}
                    </th>
                  ))}
                </tr>
              )}

              {/* Column headers */}
              <tr>
                {draggableRows && (
                  <th scope="col" className={cn("w-10 border-b border-border bg-gray-50/95", pad)}>
                    <span className="sr-only">드래그</span>
                  </th>
                )}
                {showRowNumbers && (
                  <th scope="col" className={cn("w-12 border-b border-border bg-gray-50/95 text-center text-muted-light", pad)}>
                    #
                  </th>
                )}
                {selectable && (
                  <th scope="col" className={cn("sticky left-0 z-20 w-12 border-b border-border bg-gray-50/95", pad)}>
                    <div className="flex items-center justify-center">
                      <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} size="sm" />
                    </div>
                  </th>
                )}
                {expandable && (
                  <th scope="col" className={cn("w-10 border-b border-border bg-gray-50/95", pad)} style={{ left: checkColWidth || undefined }}>
                    <span className="sr-only">확장</span>
                  </th>
                )}
                {columns.map((col) => {
                  const align = col.align ?? "left";
                  const sortState = sorts.find((s) => s.key === col.key);
                  const sortIdx = sorts.findIndex((s) => s.key === col.key);

                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={col.sortable ? (sortState ? (sortState.dir === "asc" ? "ascending" : "descending") : "none") : undefined}
                      className={cn(
                        "border-b border-border text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap relative",
                        pad,
                        alignClass[align],
                        col.sticky && "sticky z-10 bg-gray-50/95",
                      )}
                      style={getColumnStyle(col)}
                    >
                      <div className={cn("flex items-center gap-1", headerContentClass[align])}>
                        {col.sortable ? (
                          <button
                            type="button"
                            onClick={(e) => handleSort(col.key, e.shiftKey)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md text-inherit transition-colors cursor-pointer",
                              "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                            )}
                            title="클릭: 정렬, Shift+클릭: 멀티 정렬"
                          >
                            <span>{col.header}</span>
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center text-muted-light transition-all",
                                sortState ? "opacity-100 text-primary" : "opacity-35",
                                sortState?.dir === "desc" && "rotate-180",
                              )}
                            >
                              <ChevronIcon dir="up" />
                            </span>
                            {sorts.length > 1 && sortIdx >= 0 && (
                              <span className="text-[9px] text-primary font-bold">{sortIdx + 1}</span>
                            )}
                          </button>
                        ) : (
                          <span>{col.header}</span>
                        )}
                        {col.filterable && (
                          <ColumnFilter value={columnFilters[col.key] ?? ""} onChange={(v) => setColumnFilter(col.key, v)} />
                        )}
                      </div>
                      {(col.resizable !== false) && <ColumnResizer onResize={(d) => handleResize(col.key, d)} />}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody ref={tableBodyRef}>
              {/* Virtual scroll spacer */}
              {virtualScroll && virtualStartIdx > 0 && (
                <tr><td colSpan={colSpan} style={{ height: virtualStartIdx * virtualRowHeight, padding: 0 }} /></tr>
              )}

              {loading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    {draggableRows && <td className={cn("w-10 border-b border-border-light bg-white", pad)} />}
                    {showRowNumbers && <td className={cn("w-12 border-b border-border-light bg-white text-center text-muted-light", pad)}>{i + 1}</td>}
                    {selectable && <td className={cn("sticky left-0 z-20 w-12 border-b border-border-light bg-white", pad)}><div className="mx-auto h-3.5 w-3.5 animate-pulse rounded bg-gray-200" /></td>}
                    {expandable && <td className={cn("w-10 border-b border-border-light bg-white", pad)} />}
                    {columns.map((col) => (
                      <td key={col.key} className={cn("border-b border-border-light", pad, alignClass[col.align ?? "left"], col.sticky && "sticky z-10 bg-white")} style={getColumnStyle(col)}>
                        <div className={cn("h-4 w-3/4 animate-pulse rounded bg-gray-200", col.align === "center" && "mx-auto", col.align === "right" && "ml-auto")} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : virtualPaged.length === 0 ? (
                <tr>
                  <td colSpan={colSpan}>
                    <EmptyState title={emptyMessage} className="py-14" />
                  </td>
                </tr>
              ) : groupBy && groupedRows ? (
                /* ── Grouped rows ── */
                groupedRows.flatMap((group) => {
                  const isCollapsed = collapsedGroups.has(group.key);
                  return [
                    <tr key={`group-${group.key}`} className="bg-gray-100/80">
                      <td
                        colSpan={colSpan}
                        className={cn("border-b border-border font-semibold text-xs cursor-pointer select-none", pad)}
                        onClick={() => toggleGroup(group.key)}
                      >
                        <div className="flex items-center gap-2">
                          <ChevronIcon dir={isCollapsed ? "right" : "down"} className="text-muted" />
                          <span>{group.key}</span>
                          <span className="text-muted-light font-normal">({group.rows.length}개)</span>
                        </div>
                      </td>
                    </tr>,
                    ...(!isCollapsed ? group.rows.map((row, idx) => {
                      const key = rowKey(row);
                      const globalIdx = displayRows.indexOf(row);
                      const isPinned = pinnedKeys.has(key);
                      const isSelected = selectedKeys?.has(key);
                      const isStriped = striped && idx % 2 === 1;
                      const isExpanded = expandedKeys.has(key);
                      const isFocused = focusedRow === idx;
                      const customRowClass = rowClassName?.(row, globalIdx);

                      return renderRow(row, key, globalIdx, idx, isPinned, isSelected, isStriped, isExpanded, isFocused, customRowClass);
                    }).flat() : []),
                  ];
                })
              ) : (
                virtualPaged.flatMap((row, idx) => {
                  const key = rowKey(row);
                  const globalIdx = virtualScroll ? virtualStartIdx + idx : (currentPage - 1) * safePageSize + idx;
                  const isPinned = pinnedKeys.has(key);
                  const isSelected = selectedKeys?.has(key);
                  const isStriped = striped && globalIdx % 2 === 1;
                  const isExpanded = expandedKeys.has(key);
                  const isFocused = focusedRow === idx;
                  const customRowClass = rowClassName?.(row, globalIdx);

                  return renderRow(row, key, globalIdx, idx, isPinned, isSelected, isStriped, isExpanded, isFocused, customRowClass);
                })
              )}

              {/* Virtual scroll bottom spacer */}
              {virtualScroll && virtualEndIdx < displayRows.length && (
                <tr><td colSpan={colSpan} style={{ height: (displayRows.length - virtualEndIdx) * virtualRowHeight, padding: 0 }} /></tr>
              )}

              {/* Summary row */}
              {showSummary && !loading && displayRows.length > 0 && (
                <tr className="bg-gray-50/80 font-semibold">
                  {draggableRows && <td className={cn("border-t-2 border-border bg-gray-50/95", pad)} />}
                  {showRowNumbers && <td className={cn("border-t-2 border-border bg-gray-50/95", pad)} />}
                  {selectable && <td className={cn("sticky left-0 z-20 border-t-2 border-border bg-gray-50/95", pad)} />}
                  {expandable && <td className={cn("border-t-2 border-border bg-gray-50/95", pad)} />}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("border-t-2 border-border text-foreground", pad, alignClass[col.align ?? "left"], col.sticky && "sticky z-10 bg-gray-50/95")}
                      style={getColumnStyle(col)}
                    >
                      {col.aggregate ? col.aggregate(displayRows) : null}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        {!loading && serverTotal > 0 && !virtualScroll && (
          <div className="flex flex-col gap-3 border-t border-border bg-gray-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted" aria-live="polite">
                <span className="font-medium text-foreground">{rangeStart}–{rangeEnd}</span>
                <span> / 총 {serverTotal}개</span>
                {!serverSide && displayRows.length !== data.length && (
                  <span className="text-muted-light"> (전체 {data.length}개 중 필터됨)</span>
                )}
              </span>
              {pageSizeOptions && pageSizeOptions.length > 1 && (
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="h-7 px-2 text-xs border border-border rounded-md outline-none cursor-pointer bg-white"
                >
                  {pageSizeOptions.map((s) => (
                    <option key={s} value={s}>{s}개씩</option>
                  ))}
                </select>
              )}
            </div>
            {totalPages > 1 && (
              <Pagination page={currentPage} totalPages={totalPages} onChange={handlePageChange} className="justify-end" />
            )}
          </div>
        )}

        {/* Virtual scroll info */}
        {virtualScroll && !loading && displayRows.length > 0 && (
          <div className="flex items-center justify-between border-t border-border bg-gray-50/60 px-4 py-2.5">
            <span className="text-xs text-muted">
              총 <span className="font-medium text-foreground">{displayRows.length}</span>개
              {displayRows.length !== data.length && <span className="text-muted-light"> (전체 {data.length}개 중 필터됨)</span>}
            </span>
          </div>
        )}
      </div>

      {/* ── Context menu ── */}
      {contextMenuState && (
        <div
          className="fixed z-[9999] min-w-[160px] bg-white border border-border rounded-lg shadow-lg py-1 animate-fade-in-scale"
          style={{ left: contextMenuState.x, top: contextMenuState.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Default: copy row key */}
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(rowKey(contextMenuState.row)); setContextMenuState(null); }}
            className="w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50 flex items-center gap-2"
          >
            <CopyIcon /> 복사
          </button>
          {/* Pin/unpin */}
          {pinnableRows && (
            <button
              type="button"
              onClick={() => { togglePin(rowKey(contextMenuState.row)); setContextMenuState(null); }}
              className="w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50 flex items-center gap-2"
            >
              <PinIcon active={pinnedKeys.has(rowKey(contextMenuState.row))} />
              {pinnedKeys.has(rowKey(contextMenuState.row)) ? "고정 해제" : "행 고정"}
            </button>
          )}
          {/* Custom context menu items */}
          {contextMenu?.(contextMenuState.row).map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { item.onClick(); setContextMenuState(null); }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50",
                item.danger && "text-danger hover:bg-danger/5",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
