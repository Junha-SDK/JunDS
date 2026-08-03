"use client";
import { cn } from "../../utils/cn";
import { Button } from "../../primitives/Button";
import { Input } from "../../primitives/Input";
import type { ReactNode } from "react";

export interface FilterBarProps {
  /** 검색 입력 */
  searchValue?: string;
  /** 검색어 변경 콜백 */
  onSearchChange?: (value: string) => void;
  /** 검색 입력 플레이스홀더 */
  searchPlaceholder?: string;
  /** 필터 요소 (Select, MultiSelect 등) */
  filters?: ReactNode;
  /** 오른쪽 액션 */
  actions?: ReactNode;
  /** 초기화 버튼 표시 */
  onReset?: () => void;
  /** 활성 필터 수 */
  activeCount?: number;
  /** 추가 클래스 */
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
 * @status stable
 * @since 2.2.0
 * @tags form, control
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
        // 좁은 칸에서 고정 폭이 그대로 넘치지 않도록 상한만 둔다.
        <div className="w-64 max-w-full min-w-0">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            size="sm"
            leftSlot={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M9.5 9.5L13 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
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
            // w-4 고정이면 두 자리 수부터 숫자가 잘린다 — 최소 폭 + 좌우 여백으로 늘어나게 둔다.
            <span className="ml-1 bg-primary text-white text-[10px] rounded-full min-w-4 h-4 px-1 inline-flex items-center justify-center tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              {activeCount}
            </span>
          )}
        </Button>
      )}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
