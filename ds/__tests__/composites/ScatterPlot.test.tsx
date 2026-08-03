import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScatterPlot } from "../../composites/ScatterPlot";

describe("ScatterPlot", () => {
  it("renders", () => {
    const { container } = render(
      <ScatterPlot series={[{ name: "a", data: [{ x: 1, y: 2 }] }]} data-testid="root" />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild 로 자식 엘리먼트가 root 가 되고 className 이 병합된다", () => {
    const { container } = render(
      <ScatterPlot asChild className="extra" series={[{ name: "a", data: [{ x: 1, y: 2 }] }]}>
        <a href="#" className="child">
          y
        </a>
      </ScatterPlot>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("A");
    expect(container.children).toHaveLength(1);
    expect(root.className).toContain("extra");
    expect(root.className).toContain("child");
  });
});
