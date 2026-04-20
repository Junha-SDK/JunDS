"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";
import type { ReactNode } from "react";

export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  children: ReactNode;
  className?: string;
}

/**
 * 우클릭 컨텍스트 메뉴
 * @example
 * <ContextMenu items={[{ key: "copy", label: "복사", shortcut: "Ctrl+C" }]}>
 *   <div>우클릭 영역</div>
 * </ContextMenu>
 */
export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, close]);

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>
      {open && (
        <Portal>
          <div
            ref={menuRef}
            className={cn(
              "fixed z-50 min-w-[180px] py-1 bg-white rounded-xl shadow-lg border border-border-light",
              "animate-fade-in",
              className,
            )}
            style={{ left: pos.x, top: pos.y }}
            role="menu"
          >
            {items.map((item) => {
              if (item.divider) {
                return (
                  <div
                    key={item.key}
                    className="my-1 border-t border-border-light"
                    role="separator"
                  />
                );
              }
              return (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.();
                    close();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer",
                    "hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed",
                    item.danger ? "text-danger hover:bg-danger-light" : "text-foreground",
                  )}
                >
                  {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-muted ml-4">{item.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </>
  );
}
