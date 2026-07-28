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
      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-3 px-4 py-2.5 rounded-xl",
          "bg-foreground text-background",
          // 화면 위에 떠 있는 막대 — 다층 그림자 + 얇은 링이라야 배경에서 떨어진다.
          "shadow-[0_14px_38px_-12px_rgba(0,0,0,0.45),0_5px_12px_-6px_rgba(0,0,0,0.25)] ring-1 ring-white/10",
          "animate-slide-up motion-reduce:animate-none",
          className,
        )}
      >
        {/* 막대 배경이 `foreground` 라 다크 모드에선 밝은 면이 된다 — 구분선/보조 글자를
            흰색으로 박으면 그때 사라진다. 전경색을 기준으로 잡는다. */}
        <span className="text-sm font-medium tabular-nums whitespace-nowrap">{count}개 선택</span>
        <div className="w-px h-5 bg-current/20" />
        <div className="flex items-center gap-2">{actions}</div>
        {onClear && (
          <>
            <div className="w-px h-5 bg-current/20" />
            <button
              type="button"
              onClick={onClear}
              className={cn(
                "text-xs whitespace-nowrap cursor-pointer rounded px-1 py-0.5 -mx-1",
                "text-background/70 hover:text-background transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/60",
              )}
            >
              선택 해제
            </button>
          </>
        )}
      </div>
    </Portal>
  );
}
