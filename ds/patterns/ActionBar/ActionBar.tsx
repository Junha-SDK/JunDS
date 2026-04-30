"use client";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";
import type { ReactNode } from "react";

export interface ActionBarProps {
  /** 선택된 항목 수 */
  count: number;
  /** 표시 여부 */
  open: boolean;
  /** 액션 버튼들 */
  actions: ReactNode;
  /** 선택 해제 */
  onClear?: () => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 플로팅 액션 바 (벌크 액션)
 * @example
 * <ActionBar
 *   open={selected.size > 0}
 *   count={selected.size}
 *   onClear={() => setSelected(new Set())}
 *   actions={<>
 *     <Button size="sm" variant="secondary">이동</Button>
 *     <Button size="sm" variant="danger">삭제</Button>
 *   </>}
 * />
 * @status stable
 * @since 2.2.0
 * @tags navigation
 */
export function ActionBar({ count, open, actions, onClear, className }: ActionBarProps) {
  if (!open) return null;

  return (
    <Portal>
      <div className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 px-4 py-2.5 rounded-xl",
        "bg-foreground text-white shadow-2xl",
        "animate-slide-up",
        className,
      )}>
        <span className="text-sm font-medium tabular-nums">
          {count}개 선택
        </span>
        <div className="w-px h-5 bg-white/20" />
        <div className="flex items-center gap-2">
          {actions}
        </div>
        {onClear && (
          <>
            <div className="w-px h-5 bg-white/20" />
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              선택 해제
            </button>
          </>
        )}
      </div>
    </Portal>
  );
}
