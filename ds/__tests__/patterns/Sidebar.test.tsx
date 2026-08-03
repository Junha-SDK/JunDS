import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DsSidebar,
  DsSidebarProvider,
  SidebarLink,
  SidebarSection,
} from "@/ds/patterns/Sidebar/Sidebar";

describe("DsSidebar (compound)", () => {
  it("exposes Provider/Link/Section as compound members (dev 에선 가드로 래핑됨)", () => {
    expect(DsSidebar.Provider).toBeDefined();
    expect(DsSidebar.Link).toBeDefined();
    expect(DsSidebar.Section).toBeDefined();
    // 기존 named export 도 계속 유효하다
    expect(DsSidebarProvider).toBeTypeOf("function");
    expect(SidebarLink).toBeTypeOf("function");
    expect(SidebarSection).toBeTypeOf("function");
  });

  it("renders assembled from members only", () => {
    render(
      <DsSidebar.Provider>
        <DsSidebar>
          <DsSidebar.Section title="메뉴">
            <DsSidebar.Link href="#" label="홈" />
          </DsSidebar.Section>
        </DsSidebar>
      </DsSidebar.Provider>,
    );
    expect(screen.getByText("홈")).toBeInTheDocument();
    expect(screen.getByText("메뉴")).toBeInTheDocument();
  });
});
