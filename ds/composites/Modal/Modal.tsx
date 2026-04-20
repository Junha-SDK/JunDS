"use client";
import { useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";
import type { ReactNode } from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  /** 오버레이 클릭으로 닫기 허용 */
  dismissible?: boolean;
  children: ReactNode;
  className?: string;
}

export interface ModalHeaderProps {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
};

/**
 * 모달 다이얼로그
 * @example
 * <Modal open={isOpen} onClose={close} size="md">
 *   <Modal.Header onClose={close}>제목</Modal.Header>
 *   <div className="p-5">내용</div>
 *   <Modal.Footer><Button>확인</Button></Modal.Footer>
 * </Modal>
 */
export function Modal({ open, onClose, size = "md", dismissible = true, children, className }: ModalProps) {
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

  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 animate-fade-in"
          onClick={dismissible ? onClose : undefined}
        />
        {/* Content */}
        <div
          className={cn(
            "relative w-full bg-white rounded-2xl shadow-2xl animate-fade-in-scale",
            "overflow-hidden flex flex-col max-h-[90vh]",
            sizeStyles[size],
            className,
          )}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
}

function ModalHeader({ children, onClose, className }: ModalHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-5 py-4 border-b border-border-light shrink-0", className)}>
      <h3 className="text-base font-semibold text-foreground">{children}</h3>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-foreground transition-colors p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn("flex items-center justify-end gap-2 px-5 py-3 border-t border-border-light bg-gray-50/50 shrink-0", className)}>
      {children}
    </div>
  );
}

Modal.Header = ModalHeader;
Modal.Footer = ModalFooter;
