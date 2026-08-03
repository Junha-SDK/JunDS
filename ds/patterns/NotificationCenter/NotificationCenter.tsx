"use client";
import { useState, useRef } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useT } from "../../providers/I18nProvider";
import { Badge } from "../../primitives/Badge";
import type { ReactNode } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  read?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface NotificationCenterProps {
  /** 알림 목록 */
  notifications: NotificationItem[];
  /** 전체 읽음 처리 콜백 */
  onMarkAllRead?: () => void;
  /** 전체 삭제 콜백 */
  onClear?: () => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 알림 센터 (벨 아이콘 + 드롭다운)
 * @example
 * <NotificationCenter notifications={[{id:"1",title:"새 업무",time:"방금"}]} />
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export function NotificationCenter({
  notifications,
  onMarkAllRead,
  onClear,
  className,
}: NotificationCenterProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={
          unread > 0 ? t("ariaNotificationsUnread", { count: unread }) : t("ariaNotifications")
        }
        aria-expanded={open}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-card-hover active:bg-border-light transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="text-muted"
          aria-hidden="true"
        >
          <path
            d="M13.5 6.75a4.5 4.5 0 10-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5s-2.25-1.5-2.25-6.75M10.3 15.75a1.5 1.5 0 01-2.6 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5">
            <Badge count={unread} />
          </span>
        )}
      </button>

      {open && (
        // 떠 있는 패널이라 그림자 한 겹으로는 배경에서 떨어지지 않는다 — 다층 그림자 + 링
        <div className="absolute right-0 top-full mt-1 w-80 bg-card border border-border rounded-2xl shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-border-light z-50 animate-fade-in-scale motion-reduce:animate-none overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-light">
            <span className="text-sm font-semibold text-foreground">알림</span>
            <div className="flex items-center gap-2">
              {onMarkAllRead && unread > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="text-[11px] text-primary-ink rounded-sm px-0.5 hover:underline transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  모두 읽음
                </button>
              )}
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[11px] text-muted rounded-sm px-0.5 hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
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
                  // 눌리는 줄이면 탭으로도 닿아야 한다 — 안 그러면 포커스 링을 걸 자리조차 없다
                  role={n.onClick ? "button" : undefined}
                  tabIndex={n.onClick ? 0 : undefined}
                  onKeyDown={
                    n.onClick
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            n.onClick?.();
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "flex gap-3 px-4 py-3 border-b border-border-light last:border-0 transition-colors",
                    n.onClick &&
                      "cursor-pointer hover:bg-card-hover active:bg-border-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/55",
                    !n.read && "bg-primary-light/30",
                  )}
                >
                  {n.icon && <span className="shrink-0 mt-0.5">{n.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm truncate", !n.read && "font-medium text-foreground")}>
                      {n.title}
                    </p>
                    {n.description && (
                      <p className="text-xs text-muted truncate">{n.description}</p>
                    )}
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
