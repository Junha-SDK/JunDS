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
  open: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionSheetAction[];
  cancelLabel?: string;
  className?: string;
}

export function ActionSheet({ open, onClose, title, actions, cancelLabel = "취소", className }: ActionSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className={cn("relative w-full max-w-lg animate-slide-up", className)}>
          <div className="bg-white rounded-2xl overflow-hidden mb-2">
            {title && <div className="px-4 py-3 text-center text-xs text-muted border-b border-border">{title}</div>}
            {actions.map((action, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { action.onClick(); onClose(); }}
                disabled={action.disabled}
                className={cn(
                  "w-full px-4 py-3.5 text-center text-sm font-medium transition-colors cursor-pointer",
                  "border-b border-border last:border-0 hover:bg-gray-50",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  action.danger ? "text-danger" : "text-primary",
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-3.5 text-center text-sm font-semibold bg-white rounded-2xl text-foreground hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Portal>
  );
}
