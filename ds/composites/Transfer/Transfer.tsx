"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";

export interface TransferItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TransferProps {
  source: TransferItem[];
  target: TransferItem[];
  onChange: (source: TransferItem[], target: TransferItem[]) => void;
  sourceTitle?: string;
  targetTitle?: string;
  searchable?: boolean;
  className?: string;
}

/**
 * 트랜스퍼 — 두 목록 간 항목 이동 컴포넌트
 * @example
 * <Transfer
 *   source={sourceItems}
 *   target={targetItems}
 *   onChange={(s, t) => { setSource(s); setTarget(t); }}
 *   sourceTitle="선택 가능"
 *   targetTitle="선택됨"
 *   searchable
 * />
 */
export function Transfer({
  source,
  target,
  onChange,
  sourceTitle = "소스",
  targetTitle = "대상",
  searchable = false,
  className,
}: TransferProps) {
  const [sourceChecked, setSourceChecked] = useState<Set<string>>(new Set());
  const [targetChecked, setTargetChecked] = useState<Set<string>>(new Set());
  const [sourceSearch, setSourceSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");

  const toggleCheck = (key: string, side: "source" | "target") => {
    const setter = side === "source" ? setSourceChecked : setTargetChecked;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const moveToTarget = () => {
    const moving = source.filter((item) => sourceChecked.has(item.key) && !item.disabled);
    const remaining = source.filter((item) => !sourceChecked.has(item.key) || item.disabled);
    onChange(remaining, [...target, ...moving]);
    setSourceChecked(new Set());
  };

  const moveToSource = () => {
    const moving = target.filter((item) => targetChecked.has(item.key) && !item.disabled);
    const remaining = target.filter((item) => !targetChecked.has(item.key) || item.disabled);
    onChange([...source, ...moving], remaining);
    setTargetChecked(new Set());
  };

  const filteredSource = searchable && sourceSearch
    ? source.filter((item) => item.label.toLowerCase().includes(sourceSearch.toLowerCase()))
    : source;

  const filteredTarget = searchable && targetSearch
    ? target.filter((item) => item.label.toLowerCase().includes(targetSearch.toLowerCase()))
    : target;

  const renderPanel = (
    title: string,
    items: TransferItem[],
    checked: Set<string>,
    side: "source" | "target",
    search: string,
    setSearch: (v: string) => void,
  ) => (
    <div className="flex-1 border border-border rounded-lg overflow-hidden min-w-[180px]">
      {/* 헤더 */}
      <div className="px-3 py-2 bg-gray-50 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted">{checked.size}/{items.length}</span>
      </div>
      {/* 검색 */}
      {searchable && (
        <div className="px-3 py-2 border-b border-border">
          <input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      )}
      {/* 목록 */}
      <div className="max-h-[240px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-3 py-4 text-xs text-muted text-center">항목 없음</div>
        ) : (
          items.map((item) => (
            <label
              key={item.key}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors",
                item.disabled && "opacity-40 cursor-not-allowed",
              )}
            >
              <input
                type="checkbox"
                checked={checked.has(item.key)}
                disabled={item.disabled}
                onChange={() => toggleCheck(item.key, side)}
                className="accent-primary"
              />
              <span className="truncate">{item.label}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {renderPanel(sourceTitle, filteredSource, sourceChecked, "source", sourceSearch, setSourceSearch)}
      {/* 이동 버튼 */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={sourceChecked.size === 0}
          onClick={moveToTarget}
          className={cn(
            "p-1.5 rounded-md border border-border transition-colors cursor-pointer",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "hover:bg-gray-100",
          )}
        >
          <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          disabled={targetChecked.size === 0}
          onClick={moveToSource}
          className={cn(
            "p-1.5 rounded-md border border-border transition-colors cursor-pointer",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "hover:bg-gray-100",
          )}
        >
          <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      {renderPanel(targetTitle, filteredTarget, targetChecked, "target", targetSearch, setTargetSearch)}
    </div>
  );
}
