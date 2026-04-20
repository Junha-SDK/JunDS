"use client";
import { useState, useRef } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Badge } from "../../primitives/Badge";
import type { ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  time: string;
  read?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAllRead?: () => void;
  onClear?: () => void;
  className?: string;
}

/**
 * 알림 센터 (벨 아이콘 + 드롭다운)
 * @example
 * <NotificationCenter notifications={[{id:"1",title:"새 업무",time:"방금"}]} />
 */
export function NotificationCenter({ notifications, onMarkAllRead, onClear, className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-muted">
          <path d="M13.5 6.75a4.5 4.5 0 10-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5s-2.25-1.5-2.25-6.75M10.3 15.75a1.5 1.5 0 01-2.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5">
            <Badge count={unread} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-border rounded-xl shadow-xl z-50 animate-fade-in-scale overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-light">
            <span className="text-sm font-semibold text-foreground">알림</span>
            <div className="flex items-center gap-2">
              {onMarkAllRead && unread > 0 && (
                <button onClick={onMarkAllRead} className="text-[11px] text-primary hover:underline cursor-pointer">
                  모두 읽음
                </button>
              )}
              {onClear && (
                <button onClick={onClear} className="text-[11px] text-muted hover:text-foreground cursor-pointer">
                  비우기
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">알림이 없습니다</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={n.onClick}
                  className={cn(
                    "flex gap-3 px-4 py-3 border-b border-border-light last:border-0 transition-colors",
                    n.onClick && "cursor-pointer hover:bg-gray-50",
                    !n.read && "bg-primary-light/30",
                  )}
                >
                  {n.icon && <span className="shrink-0 mt-0.5">{n.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm truncate", !n.read && "font-medium text-foreground")}>{n.title}</p>
                    {n.description && <p className="text-xs text-muted truncate">{n.description}</p>}
                    <p className="text-[10px] text-muted-light mt-0.5">{n.time}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
