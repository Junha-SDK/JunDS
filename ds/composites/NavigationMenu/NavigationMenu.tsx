"use client";
import { useState, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface NavMenuChild {
  key: string;
  label: string;
  description?: string;
  href: string;
  icon?: ReactNode;
}

export interface NavMenuItem {
  key: string;
  label: string;
  href?: string;
  children?: NavMenuChild[];
}

export interface NavigationMenuProps {
  /** 메뉴 항목 목록 */
  items: NavMenuItem[];
  className?: string;
}

/**
 * 네비게이션 메뉴
 * 메가메뉴 스타일의 드롭다운 패널을 지원하는 수평 내비게이션 바
 * @example
 * <NavigationMenu items={[{key:"home",label:"홈",href:"/"},{key:"products",label:"제품",children:[{key:"a",label:"A",href:"/a"}]}]} />
 */
export function NavigationMenu({ items, className }: NavigationMenuProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback((key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenKey(key);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpenKey(null), 150);
  }, []);

  return (
    <nav className={cn("relative flex items-center gap-1 bg-surface border border-border rounded-xl px-2 py-1", className)}>
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openKey === item.key;

        return (
          <div
            key={item.key}
            className="relative"
            onMouseEnter={() => hasChildren && handleEnter(item.key)}
            onMouseLeave={handleLeave}
          >
            {hasChildren ? (
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                  isOpen ? "bg-gray-100 text-foreground" : "text-muted hover:text-foreground hover:bg-gray-50",
                )}
              >
                {item.label}
                <svg
                  className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <a
                href={item.href ?? "#"}
                className="block px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-gray-50 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            )}

            {hasChildren && isOpen && (
              <div
                className="absolute top-full left-0 mt-1 min-w-[280px] bg-surface border border-border rounded-xl shadow-lg p-2 z-50"
                onMouseEnter={() => handleEnter(item.key)}
                onMouseLeave={handleLeave}
              >
                {item.children!.map((child) => (
                  <a
                    key={child.key}
                    href={child.href}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {child.icon && (
                      <span className="mt-0.5 text-muted">{child.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{child.label}</div>
                      {child.description && (
                        <div className="text-xs text-muted mt-0.5 line-clamp-2">{child.description}</div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
