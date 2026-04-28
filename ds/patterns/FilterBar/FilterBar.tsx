"use client";
import { cn } from "../../utils/cn";
import { Button } from "../../primitives/Button";
import { Input } from "../../primitives/Input";
import type { ReactNode } from "react";

export interface FilterBarProps {
  /** 검색 입력 */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** 필터 요소 (Select, MultiSelect 등) */
  filters?: ReactNode;
  /** 오른쪽 액션 */
  actions?: ReactNode;
  /** 초기화 버튼 표시 */
  onReset?: () => void;
  /** 활성 필터 수 */
  activeCount?: number;
  className?: string;
}

/**
 * 필터 바
 * @example
 * <FilterBar
 *   searchValue={q} onSearchChange={setQ}
 *   filters={<><Select ... /><Select ... /></>}
 *   actions={<Button>내보내기</Button>}
 *   onReset={clearFilters}
 *   activeCount={2}
 * />
 */
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "검색...",
  filters,
  actions,
  onReset,
  activeCount,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {onSearchChange && (
        <div className="w-64">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            size="sm"
            leftSlot={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
      )}
      {filters}
      {onReset && (activeCount ?? 0) > 0 && (
        <Button variant="ghost" size="xs" onClick={onReset}>
          초기화
          {activeCount && activeCount > 0 && (
            <span className="ml-1 bg-primary text-white text-[10px] rounded-full w-4 h-4 inline-flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      )}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
