import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GanttChart } from "../../patterns/GanttChart";

describe("GanttChart", () => {
  it("renders", () => {
    const { container } = render(
      <GanttChart
        tasks={[{ id: "a", name: "A", start: "2026-04-01", end: "2026-04-05" }]}
        data-testid="root"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <GanttChart
        asChild
        tasks={[{ id: "a", name: "A", start: "2026-04-01", end: "2026-04-05" }]}
        className="extra-class"
      >
        <a href="#" className="child">
          y
        </a>
      </GanttChart>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("rounded-xl");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
