"use client";
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition = "top-right" | "top-center" | "bottom-right" | "bottom-center";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="#2f8f57" strokeWidth="1.5" />
      <path d="M5.5 9.5l2 2 5-5" stroke="#2f8f57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="#dc3f3f" strokeWidth="1.5" />
      <path d="M6.5 6.5l5 5M11.5 6.5l-5 5" stroke="#dc3f3f" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L1.5 15.5h15L9 2z" stroke="#b7791f" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 7v3.5M9 13h.01" stroke="#b7791f" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="#5b4cc7" strokeWidth="1.5" />
      <path d="M9 8v4.5M9 5.5h.01" stroke="#5b4cc7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

const typeStyles: Record<ToastType, string> = {
  success: "border-success/20 bg-success-light",
  error: "border-danger/20 bg-danger-light",
  warning: "border-warning/20 bg-warning-light",
  info: "border-primary/20 bg-primary-light",
};

const positionStyles: Record<ToastPosition, string> = {
  "top-right": "top-4 right-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

let nextId = 0;

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

/**
 * 토스트 프로바이더
 * @example
 * <DsToastProvider position="bottom-right">
 *   <App />
 * </DsToastProvider>
 *
 * const { toast } = useDsToast();
 * toast("저장되었습니다", "success");
 */
export function DsToastProvider({ children, position = "bottom-right", maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 3500) => {
    const id = nextId++;
    setToasts((prev) => [...prev.slice(-(maxToasts - 1)), { id, type, message, duration }]);
  }, [maxToasts]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    warning: (msg) => addToast(msg, "warning"),
    info: (msg) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <Portal>
        <div className={cn("fixed z-70 flex flex-col gap-2 pointer-events-none", positionStyles[position])}>
          {toasts.map((t) => (
            <ToastItem key={t.id} item={t} onRemove={remove} />
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [item, onRemove]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg",
        "animate-slide-in-right min-w-[280px] max-w-md",
        typeStyles[item.type],
      )}
    >
      <span className="shrink-0">{icons[item.type]}</span>
      <p className="text-sm text-foreground flex-1">{item.message}</p>
      <button
        onClick={() => onRemove(item.id)}
        className="text-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function useDsToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useDsToast는 DsToastProvider 안에서 사용하세요");
  return ctx;
}
