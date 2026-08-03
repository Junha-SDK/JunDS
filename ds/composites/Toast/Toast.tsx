"use client";
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-right"
  | "top-center"
  | "top-left"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left";

interface ToastItem {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  content?: ReactNode;
  action?: { label: string; onClick: () => void };
  blocking?: boolean;
  duration: number;
  onClose?: () => void;
}

export interface ToastOptions {
  /** 메시지 위에 굵게 놓일 제목 */
  title?: string;
  /** 오른쪽에 붙는 액션 버튼 */
  action?: { label: string; onClick: () => void };
  /**
   * 배경을 가리고 Escape·닫기 버튼을 막는다.
   * 사용자의 응답을 반드시 받아야 하는 토스트에만 쓴다.
   */
  blocking?: boolean;
  /** 자동으로 닫히기까지의 시간 (ms). `0` 이면 자동으로 닫히지 않는다 */
  duration?: number;
  /** 토스트가 사라질 때 호출 */
  onClose?: () => void;
}

/** `show()` 에 넘기는 전체 옵션 */
export interface ShowToastOptions extends ToastOptions {
  type?: ToastType;
  message?: string;
  /** 메시지 대신 렌더할 커스텀 노드 */
  content?: ReactNode;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  custom: (content: ReactNode, options?: { blocking?: boolean; duration?: number }) => void;
  confirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  /** 토스트를 띄우고 id 를 돌려준다 — 나중에 `close(id)` 로 직접 닫을 때 쓴다 */
  show: (options: ShowToastOptions) => number;
  /** id 로 특정 토스트를 닫는다 */
  close: (id: number) => void;
  /** 떠 있는 토스트를 모두 닫는다 (라우트 전환 등) */
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// 아이콘 색을 hex 로 굳혀 두면 BrandProvider 가 --primary 를 바꿔도 정보 아이콘만 옛 보라색으로
// 남고, 다크 팔레트가 의미색을 조정해도 따라가지 못한다. 토큰을 그대로 참조한다.
const icons: Record<ToastType, ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="var(--success)" strokeWidth="1.5" />
      <path
        d="M5.5 9.5l2 2 5-5"
        stroke="var(--success)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="var(--danger)" strokeWidth="1.5" />
      <path
        d="M6.5 6.5l5 5M11.5 6.5l-5 5"
        stroke="var(--danger)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 2L1.5 15.5h15L9 2z"
        stroke="var(--warning)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 7v3.5M9 13h.01" stroke="var(--warning)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="var(--primary)" strokeWidth="1.5" />
      <path
        d="M9 8v4.5M9 5.5h.01"
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

// `dark:` 는 이 저장소에서 OS 선호도(prefers-color-scheme)를 따르지만 테마 전환은
// [data-theme="dark"] 로 한다 — 둘이 어긋나면 앱은 다크인데 토스트만 흰색이 된다.
// --card 는 테마 속성을 따라가므로 변형 없이 한 줄로 끝난다.
const typeStyles: Record<ToastType, string> = {
  success: "border-border/60 border-l-4 border-l-success bg-card",
  error: "border-border/60 border-l-4 border-l-danger bg-card",
  warning: "border-border/60 border-l-4 border-l-warning bg-card",
  info: "border-border/60 border-l-4 border-l-primary bg-card",
};

const positionStyles: Record<ToastPosition, string> = {
  "top-right": "top-4 right-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-left": "bottom-4 left-4",
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
export function DsToastProvider({
  children,
  position = "bottom-right",
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // 전체화면(예: 발표 모드, 동영상) 중에는 body 에 붙인 포털이 화면에 나오지
  // 않는다. 전체화면 엘리먼트가 바뀔 때마다 포털 루트를 그쪽으로 옮긴다.
  const [portalRoot, setPortalRoot] = useState<Element | undefined>(undefined);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const update = () => setPortalRoot(document.fullscreenElement ?? undefined);
    update();
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => {
      prev.find((t) => t.id === id)?.onClose?.();
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setToasts((prev) => {
      prev.forEach((t) => t.onClose?.());
      return [];
    });
  }, []);

  const addToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration = 3500,
      extra?: Partial<Pick<ToastItem, "content" | "action" | "blocking" | "title" | "onClose">>,
    ): number => {
      const id = nextId++;
      const blocking = extra?.blocking ?? false;
      setToasts((prev) => [
        ...prev.slice(-(maxToasts - 1)),
        {
          id,
          type,
          message,
          duration,
          title: extra?.title,
          content: extra?.content,
          action: extra?.action,
          blocking,
          onClose: extra?.onClose,
        },
      ]);
      return id;
    },
    [maxToasts],
  );

  const confirm = useCallback(
    (message: string, onConfirm: () => void, onCancel?: () => void) => {
      // id 를 먼저 확보해서 버튼 클로저에 담는다. `nextId - 1` 을 클릭 시점에
      // 읽으면 그 사이 다른 토스트가 뜬 경우 엉뚱한 토스트를 닫게 된다.
      const id = nextId++;
      setToasts((prev) => [
        ...prev.slice(-(maxToasts - 1)),
        {
          id,
          type: "info",
          message,
          duration: 0,
          blocking: true,
          content: (
            <div className="flex flex-col gap-2 w-full">
              <p className="text-sm text-foreground">{message}</p>
              <div className="flex gap-2 justify-end">
                {onCancel && (
                  <button
                    onClick={() => {
                      onCancel();
                      remove(id);
                    }}
                    className="px-3 py-1 text-xs rounded-lg border border-border text-muted hover:text-foreground hover:bg-surface-soft active:scale-[0.97] motion-reduce:active:scale-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    취소
                  </button>
                )}
                <button
                  onClick={() => {
                    onConfirm();
                    remove(id);
                  }}
                  className="px-3 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary-hover active:scale-[0.97] motion-reduce:active:scale-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  확인
                </button>
              </div>
            </div>
          ),
        },
      ]);
    },
    [maxToasts, remove],
  );

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (msg, opts) => addToast(msg, "success", opts?.duration ?? 3500, opts),
    error: (msg, opts) => addToast(msg, "error", opts?.duration ?? 3500, opts),
    warning: (msg, opts) => addToast(msg, "warning", opts?.duration ?? 3500, opts),
    info: (msg, opts) => addToast(msg, "info", opts?.duration ?? 3500, opts),
    custom: (content, opts) =>
      addToast("", "info", opts?.duration ?? 3500, { content, blocking: opts?.blocking }),
    confirm,
    show: (opts) => addToast(opts.message ?? "", opts.type ?? "info", opts.duration ?? 3500, opts),
    close: remove,
    clear,
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <Portal container={portalRoot}>
        {toasts.some((t) => t.blocking) && (
          <div className="fixed inset-0 z-69 bg-black/10 pointer-events-auto" />
        )}
        <div
          aria-live="polite"
          className={cn(
            "fixed z-70 flex flex-col gap-2 pointer-events-none",
            positionStyles[position],
          )}
        >
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
        "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border",
        // 떠 있는 알림은 한 겹 그림자로는 유령처럼 보인다 — 근거리/원거리 두 겹 + 얇은 링.
        "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.28),0_4px_10px_-4px_rgba(0,0,0,0.16)] ring-1 ring-black/[0.04]",
        "animate-slide-in-right motion-reduce:animate-none min-w-[280px] max-w-md",
        typeStyles[item.type],
      )}
    >
      {item.content ? (
        <div className="flex-1">{item.content}</div>
      ) : (
        <>
          <span className="shrink-0 self-start mt-0.5">{icons[item.type]}</span>
          <div className="flex-1">
            {item.title && <p className="text-sm font-semibold text-foreground">{item.title}</p>}
            <p className="text-sm text-foreground">{item.message}</p>
          </div>
          {item.action && (
            <button
              onClick={() => {
                item.action!.onClick();
                onRemove(item.id);
              }}
              className="px-2 py-1 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-hover active:scale-[0.97] motion-reduce:active:scale-100 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {item.action.label}
            </button>
          )}
        </>
      )}
      {!item.blocking && (
        <button
          onClick={() => onRemove(item.id)}
          aria-label="알림 닫기"
          className="p-1 -m-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-soft transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 3l8 8M11 3l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
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
