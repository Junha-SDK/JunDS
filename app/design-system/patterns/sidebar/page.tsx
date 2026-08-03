"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { DsSidebarProvider, DsSidebar, SidebarLink, SidebarSection } from "@/ds/patterns/Sidebar";
import { CodeBlock } from "../../_components/CodeBlock";

export default function SidebarPage() {
  return (
    <ComponentPage
      name="Sidebar"
      description="접이식 사이드바 네비게이션. Provider + Sidebar + Link + Section."
      importPath='import { DsSidebarProvider, DsSidebar, SidebarLink, SidebarSection } from "@/ds/patterns/Sidebar"'
      props={[
        { name: "header", type: "ReactNode", description: "상단 영역" },
        { name: "footer", type: "ReactNode", description: "하단 영역" },
        { name: "width", type: "number", default: "264", description: "펼친 너비(px)" },
        { name: "collapsedWidth", type: "number", default: "68", description: "접힌 너비(px)" },
      ]}
    >
      <Section title="Demo">
        <div className="border border-border rounded-xl overflow-hidden">
          <DsSidebarProvider>
            <div className="flex h-[380px]">
              <DsSidebar
                header={<span className="text-white font-bold text-lg">junDS</span>}
                footer={<span className="text-xs text-sidebar-text">v1.0.0</span>}
              >
                <SidebarSection title="메뉴">
                  <SidebarLink href="#" label="대시보드" active />
                  <SidebarLink href="#" label="프로젝트" badge={3} />
                  <SidebarLink href="#" label="업무" />
                </SidebarSection>
                <SidebarSection title="설정">
                  <SidebarLink href="#" label="계정" />
                  <SidebarLink href="#" label="알림" />
                </SidebarSection>
              </DsSidebar>
              <div className="flex-1 bg-background p-6 min-w-0">
                <p className="text-sm text-muted">토글 버튼을 클릭하여 접기/펼치기를 시도하세요.</p>
              </div>
            </div>
          </DsSidebarProvider>
        </div>
      </Section>

      <Section title="Code">
        <CodeBlock
          code={`<DsSidebarProvider>
  <DsSidebar header={<Logo />}>
    <SidebarSection title="메뉴">
      <SidebarLink href="/" label="홈" icon={<HomeIcon />} active />
      <SidebarLink href="/projects" label="프로젝트" badge={3} />
    </SidebarSection>
  </DsSidebar>
</DsSidebarProvider>`}
        />
      </Section>
    </ComponentPage>
  );
}
