"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { cn } from "../../utils/cn";

// ─── Context ────────────────────────────
interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export interface SidebarProviderProps {
  /** 사이드바 본문 */
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function DsSidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const toggle = useCallback(() => setCollapsed((p) => !p), []);
  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ─── Sidebar ────────────────────────────
export interface SidebarProps {
  /** 상단 헤더 영역 */
  header?: ReactNode;
  /** 하단 푸터 영역 */
  footer?: ReactNode;
  /** 사이드바 본문 */
  children: ReactNode;
  /** 펼친 상태 너비(px) */
  width?: number;
  /** 접힌 상태 너비(px) */
  collapsedWidth?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 사이드바
 * @example
 * <DsSidebarProvider>
 *   <DsSidebar header={<Logo />}>
 *     <SidebarLink href="/" label="홈" icon={<HomeIcon />} />
 *   </DsSidebar>
 * </DsSidebarProvider>
 * @status stable
 * @since 2.2.0
 * @tags navigation
 */
export function DsSidebar({
  header,
  footer,
  children,
  width = 264,
  collapsedWidth = 68,
  className,
}: SidebarProps) {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "h-full flex flex-col bg-sidebar-bg text-sidebar-text shrink-0",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "border-r border-white/5 relative",
        className,
      )}
      style={{ width: collapsed ? collapsedWidth : width }}
    >
      {header && (
        <div className="px-3 py-4 border-b border-white/5 shrink-0">
          {header}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2">
        {children}
      </nav>

      {footer && (
        <div className="px-3 py-3 border-t border-white/5 shrink-0">
          {footer}
        </div>
      )}

      {/* Toggle */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "absolute -right-3 top-6 w-6 h-6 rounded-full",
          "bg-white border border-border shadow-sm flex items-center justify-center",
          "hover:bg-gray-50 transition-colors z-10 cursor-pointer",
        )}
      >
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={cn("text-muted transition-transform duration-200", collapsed && "rotate-180")}
        >
          <path d="M7.5 2.5l-3 3.5 3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </aside>
  );
}

// ─── SidebarLink ────────────────────────
export interface SidebarLinkProps {
  href: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

export function SidebarLink({ href, label, icon, active, badge, onClick }: SidebarLinkProps) {
  const { collapsed } = useSidebar();

  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        "hover:bg-sidebar-hover",
        active
          ? "bg-sidebar-hover text-white border-l-2 border-sidebar-active"
          : "text-sidebar-text",
      )}
    >
      {icon && <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>}
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="bg-danger text-white text-[10px] rounded-full px-1.5 py-0.5 font-semibold">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </a>
  );
}

// ─── SidebarSection ─────────────────────
export interface SidebarSectionProps {
  title?: string;
  /** 사이드바 본문 */
  children: ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="mb-2">
      {title && !collapsed && (
        <div className="px-3 py-1.5 text-[10px] font-semibold text-sidebar-text/50 uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
