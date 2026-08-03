"use client";
import { useState, useCallback, useEffect } from "react";
import { Box } from "../core/Box";
import { cn } from "../utils/cn";
import type { ReactNode } from "react";
import type { Responsive, SpacingToken } from "../core/styleProps";

export interface AppShellProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** 사이드바 너비 (px) */
  sidebarWidth?: number;
  /** 접힌 사이드바 너비 (px) */
  collapsedWidth?: number;
  /** 사이드바 접힘 상태 */
  sidebarCollapsed?: boolean;
  /** 사이드바 접힘 토글 핸들러 */
  onSidebarToggle?: (collapsed: boolean) => void;
  /** 모바일 브레이크포인트 (px) — 이 미만에서 사이드바가 오버레이 */
  mobileBreakpoint?: number;
  /** 메인 콘텐츠 패딩 */
  contentPadding?: Responsive<SpacingToken>;
  /** 고정 헤더 */
  stickyHeader?: boolean;
  className?: string;
}

export function AppShell({
  sidebar,
  header,
  footer,
  children,
  sidebarWidth = 260,
  collapsedWidth = 64,
  sidebarCollapsed = false,
  onSidebarToggle,
  mobileBreakpoint = 768,
  contentPadding,
  stickyHeader = false,
  className,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < mobileBreakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [mobileBreakpoint]);

  // Keyboard shortcut: Ctrl+B to toggle sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        if (isMobile) setMobileOpen((prev) => !prev);
        else onSidebarToggle?.(!sidebarCollapsed);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isMobile, sidebarCollapsed, onSidebarToggle]);

  // Lock body scroll on mobile overlay
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sw = sidebarCollapsed ? collapsedWidth : sidebarWidth;

  return (
    <Box display="flex" h="screenH" overflow="hidden" bg="background" className={className}>
      {/* Desktop Sidebar — bg 는 인라인 style 로 나가므로 `white` 리터럴이면 다크에서 그대로 흰 판이 된다 */}
      {sidebar && !isMobile && (
        <Box
          as="aside"
          shrink={0}
          overflow="auto"
          border
          borderWidth={0}
          bg="card"
          transition="slow"
          style={{
            width: sw,
            borderRight: "1px solid var(--border)",
            transition: "width 300ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {sidebar}
        </Box>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebar && isMobile && mobileOpen && (
        <>
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex="overlay"
            bg="black"
            opacity={0.3}
            onClick={() => setMobileOpen(false)}
            style={{ zIndex: 1300 }}
          />
          <Box
            as="aside"
            position="fixed"
            top={0}
            left={0}
            bottom={0}
            zIndex="modal"
            bg="card"
            overflow="auto"
            shadow="xl"
            style={{ width: sidebarWidth, zIndex: 1400 }}
          >
            {sidebar}
          </Box>
        </>
      )}

      {/* Main Content Area */}
      <Box display="flex" direction="column" grow={1} minW={0}>
        {/* Header */}
        {header && (
          <Box
            as="header"
            shrink={0}
            bg="card"
            position={stickyHeader ? "sticky" : undefined}
            top={stickyHeader ? 0 : undefined}
            zIndex={stickyHeader ? "sticky" : undefined}
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            {/* Mobile menu button */}
            {isMobile && sidebar && (
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg cursor-pointer text-muted",
                  "transition-colors hover:text-foreground hover:bg-card-hover active:bg-muted/15",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                )}
                aria-label="사이드바 열기"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3 4.5h12M3 9h12M3 13.5h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
            {header}
          </Box>
        )}

        {/* Main */}
        <Box as="main" grow={1} overflow="auto" p={contentPadding}>
          {children}
        </Box>

        {/* Footer */}
        {footer && (
          <Box as="footer" shrink={0} bg="card" style={{ borderTop: "1px solid var(--border)" }}>
            {footer}
          </Box>
        )}
      </Box>
    </Box>
  );
}
