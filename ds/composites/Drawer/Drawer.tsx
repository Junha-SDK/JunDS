"use client";
import { useEffect, useCallback, forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";
import type { ReactNode } from "react";

export type DrawerSide = "left" | "right" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  size?: DrawerSize;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
  className?: string;
}

/** Drawer panel widths — fixed sizes for consistent layout, not spacing tokens */
const sizeMap: Record<DrawerSide, Record<DrawerSize, string>> = {
  right: { sm: "w-full sm:w-80", md: "w-full sm:w-[420px]", lg: "w-full sm:w-[560px]", xl: "w-full sm:w-[720px]" },
  left: { sm: "w-full sm:w-80", md: "w-full sm:w-[420px]", lg: "w-full sm:w-[560px]", xl: "w-full sm:w-[720px]" },
  bottom: { sm: "h-48", md: "h-72", lg: "h-96", xl: "h-[480px]" },
};

const slideIn: Record<DrawerSide, string> = {
  right: "translate-x-0",
  left: "translate-x-0",
  bottom: "translate-y-0",
};

const slideOut: Record<DrawerSide, string> = {
  right: "translate-x-full",
  left: "-translate-x-full",
  bottom: "translate-y-full",
};

const positionClass: Record<DrawerSide, string> = {
  right: "right-0 top-0 h-full",
  left: "left-0 top-0 h-full",
  bottom: "bottom-0 left-0 w-full",
};

/**
 * 슬라이드 인 패널 (Drawer / Sheet)
 * @example
 * <Drawer open={isOpen} onClose={close} side="right" title="필터">
 *   <FilterContent />
 * </Drawer>
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  ({
  open,
  onClose,
  side = "right",
  size = "md",
  title,
  children,
  footer,
  dismissible = true,
  className,
}, ref) => {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={dismissible ? onClose : undefined}
      />
      {/* Panel */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "fixed z-50 bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          positionClass[side],
          sizeMap[side][size],
          open ? slideIn[side] : slideOut[side],
          className,
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-border/40 bg-gray-50/30 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </Portal>
  );
},
);
Drawer.displayName = "Drawer";
