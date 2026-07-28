"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";
import { useT } from "../../providers/I18nProvider";

export interface TransferItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TransferProps {
  /** 출발측 항목 */
  source: TransferItem[];
  /** 도착측 항목 */
  target: TransferItem[];
  /** 이동 시 콜백 */
  onChange: (source: TransferItem[], target: TransferItem[]) => void;
  /** 출발측 제목 */
  sourceTitle?: string;
  /** 도착측 제목 */
  targetTitle?: string;
  /** 검색 활성화 */
  searchable?: boolean;
  /** 추가 클래스 */
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
 * @status stable
 * @since 2.2.0
 * @tags form, input
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
  const t = useT();
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

  const filteredSource =
    searchable && sourceSearch
      ? source.filter((item) => item.label.toLowerCase().includes(sourceSearch.toLowerCase()))
      : source;

  const filteredTarget =
    searchable && targetSearch
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
    <div className="flex-1 border border-border rounded-xl overflow-hidden min-w-[180px] bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* 헤더 — bg-gray-50 은 라이트 전용이라 다크에서 패널 머리만 하얗게 뜬다. */}
      <div className="px-3 py-2 bg-card-hover border-b border-border flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium text-foreground">{title}</span>
        <span className="shrink-0 text-xs text-muted tabular-nums">
          {checked.size}/{items.length}
        </span>
      </div>
      {/* 검색 */}
      {searchable && (
        <div className="px-3 py-2 border-b border-border">
          <input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 text-sm bg-card border border-border rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
                "flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors duration-150",
                "hover:bg-card-hover",
                // 포커스를 받는 건 안쪽 체크박스다 — 어느 행에 있는지는 행이 알려 준다.
                "focus-within:bg-card-hover focus-within:ring-1 focus-within:ring-inset focus-within:ring-primary/40",
                item.disabled && "opacity-40 cursor-not-allowed",
              )}
            >
              <input
                type="checkbox"
                checked={checked.has(item.key)}
                disabled={item.disabled}
                onChange={() => toggleCheck(item.key, side)}
                className="accent-primary shrink-0"
              />
              <span className="min-w-0 truncate">{item.label}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {renderPanel(
        sourceTitle,
        filteredSource,
        sourceChecked,
        "source",
        sourceSearch,
        setSourceSearch,
      )}
      {/* 이동 버튼 */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={sourceChecked.size === 0}
          onClick={moveToTarget}
          aria-label={t("ariaTransferTo", { target: targetTitle })}
          className={cn(
            "p-1.5 rounded-lg border border-border bg-card cursor-pointer",
            "transition-[background-color,transform] duration-150 active:scale-[0.94]",
            // hover:bg-gray-100 은 라이트 전용 값이었다.
            "hover:bg-card-hover",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
          )}
        >
          <svg
            className="w-4 h-4 text-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          disabled={targetChecked.size === 0}
          onClick={moveToSource}
          aria-label={t("ariaTransferTo", { target: sourceTitle })}
          className={cn(
            "p-1.5 rounded-lg border border-border bg-card cursor-pointer",
            "transition-[background-color,transform] duration-150 active:scale-[0.94]",
            // hover:bg-gray-100 은 라이트 전용 값이었다.
            "hover:bg-card-hover",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
          )}
        >
          <svg
            className="w-4 h-4 text-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      {renderPanel(
        targetTitle,
        filteredTarget,
        targetChecked,
        "target",
        targetSearch,
        setTargetSearch,
      )}
    </div>
  );
}
