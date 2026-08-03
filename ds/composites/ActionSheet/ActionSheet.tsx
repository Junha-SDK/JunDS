"use client";
import { useEffect } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";

export interface ActionSheetAction {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface ActionSheetProps {
  /** 열림 상태 */
  open: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 상단 제목 */
  title?: string;
  /** 액션 목록 */
  actions: ActionSheetAction[];
  /** 취소 버튼 라벨 */
  cancelLabel?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 모바일 친화적인 하단 액션 시트. 여러 액션을 리스트로 노출합니다.
 * @example
 * <ActionSheet
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   actions={[{ label: "삭제", onClick: handleDelete, variant: "danger" }]}
 * />
 * @status stable
 * @since 2.2.0
 * @tags overlay
 */
export function ActionSheet({
  open,
  onClose,
  title,
  actions,
  cancelLabel = "취소",
  className,
}: ActionSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in motion-reduce:animate-none"
          onClick={onClose}
        />
        <div
          className={cn(
            "relative w-full max-w-lg animate-slide-up motion-reduce:animate-none",
            className,
          )}
        >
          {/* 떠 있는 시트다 — 그림자 한 겹은 유령이라 다층 그림자 + 얇은 링으로 세운다 */}
          <div className="bg-card rounded-2xl overflow-hidden mb-2 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-border-light">
            {title && (
              <div className="px-4 py-3 text-center text-xs text-muted border-b border-border">
                {title}
              </div>
            )}
            {actions.map((action, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                disabled={action.disabled}
                className={cn(
                  "w-full px-4 py-3.5 text-center text-sm font-medium transition-colors cursor-pointer",
                  "border-b border-border last:border-0 hover:bg-card-hover active:bg-border-light",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/55",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  action.danger ? "text-danger" : "text-primary-ink",
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-3.5 text-center text-sm font-semibold bg-card rounded-2xl text-foreground shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-border-light hover:bg-card-hover active:bg-border-light cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Portal>
  );
}
