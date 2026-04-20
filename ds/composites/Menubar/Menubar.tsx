"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface MenubarSubItem {
  key: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface MenubarItem {
  key: string;
  label: string;
  items: MenubarSubItem[];
}

export interface MenubarProps {
  /** 메뉴 바 항목 목록 */
  items: MenubarItem[];
  className?: string;
}

/**
 * 메뉴바
 * macOS 스타일의 메뉴 바. 클릭으로 열고, 열린 상태에서 호버로 메뉴 전환
 * @example
 * <Menubar items={[{key:"file",label:"파일",items:[{key:"new",label:"새 파일",shortcut:"⌘N"}]}]} />
 */
export function Menubar({ items, className }: MenubarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  }, []);

  const handleHover = useCallback((key: string) => {
    setOpenKey((prev) => (prev !== null ? key : null));
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div
      ref={barRef}
      className={cn("flex items-center gap-0 bg-surface border border-border rounded-lg px-1 py-0.5 select-none", className)}
    >
      {items.map((menu) => {
        const isOpen = openKey === menu.key;
        return (
          <div key={menu.key} className="relative">
            <button
              type="button"
              onClick={() => handleClick(menu.key)}
              onMouseEnter={() => handleHover(menu.key)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer",
                isOpen ? "bg-gray-100 text-foreground" : "text-muted hover:text-foreground hover:bg-gray-50",
              )}
            >
              {menu.label}
            </button>
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
                {menu.items.map((sub) => {
                  if (sub.divider) {
                    return <div key={sub.key} className="my-1 border-t border-border" />;
                  }
                  return (
                    <button
                      key={sub.key}
                      type="button"
                      disabled={sub.disabled}
                      onClick={() => {
                        sub.onClick?.();
                        setOpenKey(null);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-colors",
                        sub.disabled
                          ? "text-muted/50 cursor-not-allowed"
                          : "text-foreground hover:bg-gray-50 cursor-pointer",
                      )}
                    >
                      <span>{sub.label}</span>
                      {sub.shortcut && (
                        <span className="ml-4 text-xs text-muted">{sub.shortcut}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
