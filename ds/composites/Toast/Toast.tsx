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
  content?: ReactNode;
  action?: { label: string; onClick: () => void };
  blocking?: boolean;
  duration: number;
}

interface ToastOptions {
  action?: { label: string; onClick: () => void };
  blocking?: boolean;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  custom: (content: ReactNode, options?: { blocking?: boolean; duration?: number }) => void;
  confirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
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
  success: "border-border/60 border-l-4 border-l-success bg-white dark:bg-gray-900",
  error: "border-border/60 border-l-4 border-l-danger bg-white dark:bg-gray-900",
  warning: "border-border/60 border-l-4 border-l-warning bg-white dark:bg-gray-900",
  info: "border-border/60 border-l-4 border-l-primary bg-white dark:bg-gray-900",
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
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export function DsToastProvider({ children, position = "bottom-right", maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 3500, extra?: Partial<Pick<ToastItem, "content" | "action" | "blocking">>) => {
    const id = nextId++;
    const blocking = extra?.blocking ?? false;
    setToasts((prev) => [...prev.slice(-(maxToasts - 1)), { id, type, message, duration, content: extra?.content, action: extra?.action, blocking }]);
  }, [maxToasts]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (msg, opts) => addToast(msg, "success", opts?.duration ?? 3500, opts),
    error: (msg, opts) => addToast(msg, "error", opts?.duration ?? 3500, opts),
    warning: (msg, opts) => addToast(msg, "warning", opts?.duration ?? 3500, opts),
    info: (msg, opts) => addToast(msg, "info", opts?.duration ?? 3500, opts),
    custom: (content, opts) => addToast("", "info", opts?.duration ?? 3500, { content, blocking: opts?.blocking }),
    confirm: (message, onConfirm, onCancel) => addToast(message, "info", 0, {
      blocking: true,
      action: undefined,
      content: (
        <div className="flex flex-col gap-2 w-full">
          <p className="text-sm text-foreground">{message}</p>
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <button
                onClick={() => { onCancel(); remove(nextId - 1); }}
                className="px-3 py-1 text-xs rounded-lg border border-border text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                취소
              </button>
            )}
            <button
              onClick={() => { onConfirm(); remove(nextId - 1); }}
              className="px-3 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      ),
    }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <Portal>
        {toasts.some((t) => t.blocking) && (
          <div className="fixed inset-0 z-69 bg-black/10 pointer-events-auto" />
        )}
        <div aria-live="polite" className={cn("fixed z-70 flex flex-col gap-2 pointer-events-none", positionStyles[position])}>
          {toasts.map((t) => (
            <SingleToast key={t.id} item={t} onRemove={remove} />
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}

function SingleToast({ item, onRemove }: { item: ToastItem; onRemove: (id: number) => void }) {
  useEffect(() => {
    if (item.blocking || item.duration === 0) return;
    const timer = setTimeout(() => onRemove(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [item, onRemove]);

  useEffect(() => {
    if (item.blocking) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRemove(item.id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [item, onRemove]);

  return (
    <div
      role="alert"
      aria-atomic="true"
      className={cn(
        "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
        "animate-slide-in-right min-w-[280px] max-w-md",
        typeStyles[item.type],
      )}
    >
      {item.content ? (
        <div className="flex-1">{item.content}</div>
      ) : (
        <>
          <span className="shrink-0">{icons[item.type]}</span>
          <p className="text-sm text-foreground flex-1">{item.message}</p>
          {item.action && (
            <button
              onClick={() => { item.action!.onClick(); onRemove(item.id); }}
              className="px-2 py-1 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
            >
              {item.action.label}
            </button>
          )}
        </>
      )}
      {!item.blocking && (
        <button
          onClick={() => onRemove(item.id)}
          className="text-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function useDsToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useDsToast는 DsToastProvider 안에서 사용하세요");
  return ctx;
}
