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
  /** 추가 클래스 */
  className?: string;
}

/**
 * 네비게이션 메뉴
 * 메가메뉴 스타일의 드롭다운 패널을 지원하는 수평 내비게이션 바
 * @example
 * <NavigationMenu items={[{key:"home",label:"홈",href:"/"},{key:"products",label:"제품",children:[{key:"a",label:"A",href:"/a"}]}]} />
 * @status stable
 * @since 2.2.0
 * @tags navigation
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
    <nav
      className={cn(
        "relative flex items-center gap-1 bg-surface border border-border rounded-xl px-2 py-1",
        className,
      )}
    >
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
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  // 회색 팔레트는 다크에서 무너진다 — muted 틴트는 nav 표면 위에서 두 모드 모두 같은 세기로 읽힌다
                  isOpen
                    ? "bg-muted/15 text-foreground"
                    : "text-muted hover:text-foreground hover:bg-muted/10",
                )}
              >
                {item.label}
                <svg
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200 motion-reduce:transition-none",
                    isOpen && "rotate-180",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <a
                href={item.href ?? "#"}
                className="block px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-muted/10 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {item.label}
              </a>
            )}

            {hasChildren && isOpen && (
              // 떠 있는 메가패널은 그림자 한 겹으로는 배경에서 떨어지지 않는다 — 다층 그림자 + 얇은 링
              <div
                className="absolute top-full left-0 mt-1 min-w-[280px] bg-surface border border-border rounded-2xl p-2 z-50 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-border-light animate-fade-in-scale motion-reduce:animate-none"
                onMouseEnter={() => handleEnter(item.key)}
                onMouseLeave={handleLeave}
              >
                {item.children!.map((child) => (
                  <a
                    key={child.key}
                    href={child.href}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset"
                  >
                    {child.icon && <span className="mt-0.5 text-muted">{child.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{child.label}</div>
                      {child.description && (
                        <div className="text-xs text-muted mt-0.5 line-clamp-2">
                          {child.description}
                        </div>
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
