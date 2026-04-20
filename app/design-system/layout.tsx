import { CollapsibleTheme } from "./_components/CollapsibleTheme";
import { ThemeRestorer } from "./_components/ThemeRestorer";
import { DarkModeToggle } from "./_components/DarkModeToggle";
import { BreakpointIndicator } from "./_components/BreakpointIndicator";
import { DsSidebar } from "./_components/DsSidebar";
import { LabMainWrapper } from "./_components/LabMainWrapper";
import Link from "next/link";

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <ThemeRestorer />

      {/* 좌측 사이드바 */}
      <aside className="w-60 shrink-0 bg-[#1a1726] text-white flex flex-col border-r border-white/5">
        {/* 로고 */}
        <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
          <Link href="/design-system" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="5" height="5" rx="1" fill="white" />
                <rect x="12" y="3" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                <rect x="3" y="12" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                <rect x="12" y="12" width="5" height="5" rx="1" fill="white" opacity="0.3" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight">junDS</span>
              <span className="text-[10px] text-white/40 ml-1.5 font-medium">v1.0</span>
            </div>
          </Link>
          <DarkModeToggle />
        </div>

        {/* 테마 선택기 (접기/펼치기) */}
        <CollapsibleTheme />

        {/* 검색 + 네비 */}
        <DsSidebar />

        {/* 하단 */}
        <div className="px-4 py-3 border-t border-white/10 text-[11px] text-white/30 flex items-center justify-between">
          <span>Design System by Junha</span>
          <BreakpointIndicator />
        </div>
      </aside>

      {/* 우측 콘텐츠 */}
      <LabMainWrapper>
        {children}
      </LabMainWrapper>
    </div>
  );
}
