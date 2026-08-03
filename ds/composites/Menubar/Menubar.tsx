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
  /** 추가 클래스 */
  className?: string;
}

/**
 * 메뉴바
 * macOS 스타일의 메뉴 바. 클릭으로 열고, 열린 상태에서 호버로 메뉴 전환
 * @example
 * <Menubar items={[{key:"file",label:"파일",items:[{key:"new",label:"새 파일",shortcut:"⌘N"}]}]} />
 * @status stable
 * @since 2.2.0
 * @tags navigation
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
      className={cn(
        "flex items-center gap-0 bg-surface border border-border rounded-xl px-1 py-0.5 select-none",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        className,
      )}
    >
      {items.map((menu) => {
        const isOpen = openKey === menu.key;
        return (
          <div key={menu.key} className="relative">
            <button
              type="button"
              onClick={() => handleClick(menu.key)}
              onMouseEnter={() => handleHover(menu.key)}
              aria-expanded={isOpen}
              aria-haspopup="menu"
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
                // bg-gray-100/50 은 라이트 전용이라 다크에서 밝은 판이 남는다 — 열림 표시는 primary 틴트로
                isOpen
                  ? "bg-primary/10 text-primary-ink"
                  : "text-muted hover:text-foreground hover:bg-card-hover",
              )}
            >
              {menu.label}
            </button>
            {isOpen && (
              // 떠 있는 메뉴는 그림자 한 겹으로 배경에서 떨어지지 않는다 — 다층 그림자 + 얇은 링
              <div
                role="menu"
                className="absolute top-full left-0 mt-1 min-w-[200px] bg-surface border border-border rounded-xl shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-border-light py-1 z-50 animate-fade-in-scale motion-reduce:animate-none"
              >
                {menu.items.map((sub) => {
                  if (sub.divider) {
                    return <div key={sub.key} className="my-1 border-t border-border" />;
                  }
                  return (
                    <button
                      key={sub.key}
                      type="button"
                      role="menuitem"
                      disabled={sub.disabled}
                      onClick={() => {
                        sub.onClick?.();
                        setOpenKey(null);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-4 px-3 py-1.5 text-sm text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
                        sub.disabled
                          ? "text-muted/50 cursor-not-allowed"
                          : "text-foreground hover:bg-card-hover cursor-pointer",
                      )}
                    >
                      <span className="min-w-0 truncate">{sub.label}</span>
                      {sub.shortcut && (
                        <span className="text-xs text-muted shrink-0 whitespace-nowrap tabular-nums">
                          {sub.shortcut}
                        </span>
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
