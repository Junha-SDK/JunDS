import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RadarChart } from "../../composites/RadarChart";

describe("RadarChart", () => {
  it("renders", () => {
    const { container } = render(
      <RadarChart
        axes={["A", "B", "C"]}
        series={[{ name: "x", data: [1, 2, 3] }]}
        data-testid="root"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <RadarChart
        asChild
        axes={["A", "B", "C"]}
        series={[{ name: "x", data: [1, 2, 3] }]}
        className="extra-class"
      >
        <a href="#" className="child">
          y
        </a>
      </RadarChart>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("inline-flex");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
