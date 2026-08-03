"use client";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface OfflineIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** 오프라인 메시지 */
  offlineMessage?: ReactNode;
  /** 복구 메시지 (잠깐 표시) */
  onlineMessage?: ReactNode;
  /** 복구 메시지 표시 시간(ms) */
  onlineFlashDuration?: number;
  /** 위치 */
  position?: "top" | "bottom";
}

/**
 * 네트워크 오프라인 상태 표시 (자동 복구 알림 포함).
 * @example
 * <OfflineIndicator />
 * @status stable
 * @since 2.3.0
 * @tags feedback
 */
export const OfflineIndicator = forwardRef<HTMLDivElement, OfflineIndicatorProps>(
  function OfflineIndicator(
    {
      offlineMessage = "오프라인 상태입니다",
      onlineMessage = "다시 연결되었습니다",
      onlineFlashDuration = 3000,
      position = "top",
      className,
      ...props
    },
    ref,
  ) {
    const [online, setOnline] = useState(true);
    const [flash, setFlash] = useState(false);

    useEffect(() => {
      if (typeof navigator === "undefined") return;
      setOnline(navigator.onLine);

      const handleOnline = () => {
        setOnline(true);
        setFlash(true);
        const id = window.setTimeout(() => setFlash(false), onlineFlashDuration);
        return () => window.clearTimeout(id);
      };
      const handleOffline = () => {
        setOnline(false);
        setFlash(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }, [onlineFlashDuration]);

    if (online && !flash) return null;

    return (
      <div
        ref={ref}
        role="status"
        aria-live="assertive"
        className={cn(
          "fixed left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium",
          position === "top" ? "top-0" : "bottom-0",
          online ? "bg-success text-white" : "bg-danger text-white",
          className,
        )}
        {...props}
      >
        <span className="w-2 h-2 rounded-full bg-current opacity-80" />
        {online ? onlineMessage : offlineMessage}
      </div>
    );
  },
);
