"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  /** 메뉴 항목 목록 */
  items: ContextMenuItem[];
  /** 우클릭 영역(자식) */
  children: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 우클릭 컨텍스트 메뉴
 * @example
 * <ContextMenu items={[{ key: "copy", label: "복사", shortcut: "Ctrl+C" }]}>
 *   <div>우클릭 영역</div>
 * </ContextMenu>
 * @status stable
 * @since 2.2.0
 * @tags overlay, navigation
 */
export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  /** Actionable (non-divider, non-disabled) item indices */
  const actionableIndices = useMemo(
    () =>
      items.reduce<number[]>((acc, item, i) => {
        if (!item.divider && !item.disabled) acc.push(i);
        return acc;
      }, []),
    [items],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const menuWidth = 180;
      const menuHeight = items.length * 36;
      let x = e.clientX;
      let y = e.clientY;
      if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 8;
      if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 8;
      setPos({ x, y });
      setOpen(true);
      setFocusedIndex(-1);
    },
    [items.length],
  );

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          close();
          break;
        case "ArrowDown": {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const curPos = actionableIndices.indexOf(prev);
            const next = curPos < actionableIndices.length - 1 ? curPos + 1 : 0;
            return actionableIndices[next] ?? -1;
          });
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const curPos = actionableIndices.indexOf(prev);
            const next = curPos > 0 ? curPos - 1 : actionableIndices.length - 1;
            return actionableIndices[next] ?? -1;
          });
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (focusedIndex >= 0) {
            const item = items[focusedIndex];
            if (item && !item.disabled && !item.divider) {
              item.onClick?.();
              close();
            }
          }
          break;
        }
        default:
          break;
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close, focusedIndex, items, actionableIndices]);

  /** Focus the active button when focusedIndex changes */
  useEffect(() => {
    if (!open || focusedIndex < 0) return;
    const menu = menuRef.current;
    if (!menu) return;
    const buttons = menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    let btnIdx = 0;
    for (let i = 0; i < focusedIndex; i++) {
      if (!items[i].divider) btnIdx++;
    }
    buttons[btnIdx]?.focus();
  }, [focusedIndex, open, items]);

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>
      {open && (
        <Portal>
          <div
            ref={menuRef}
            className={cn(
              // 커서 위에 떠 있는 메뉴 — 그림자 한 겹으로는 아래 내용에서 떨어지지 않는다
              "fixed z-50 min-w-[180px] py-1 bg-card rounded-xl border border-border",
              "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-border-light",
              "animate-fade-in motion-reduce:animate-none",
              className,
            )}
            style={{ left: pos.x, top: pos.y }}
            role="menu"
          >
            {items.map((item, index) => {
              if (item.divider) {
                return (
                  <div
                    key={item.key}
                    className="my-1 border-t border-border-light"
                    role="separator"
                  />
                );
              }
              const isFocused = index === focusedIndex;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  tabIndex={isFocused ? 0 : -1}
                  disabled={item.disabled}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onClick={() => {
                    item.onClick?.();
                    close();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors duration-150 cursor-pointer",
                    // 키보드 이동은 여기로 포커스를 옮긴다 — 링이 없으면 어디에 있는지 알 수 없다
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
                    "hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed",
                    item.danger ? "text-danger hover:bg-danger-light" : "text-foreground",
                    isFocused && "bg-primary/10",
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
