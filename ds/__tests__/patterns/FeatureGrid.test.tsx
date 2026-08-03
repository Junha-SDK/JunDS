import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FeatureGrid } from "../../patterns/FeatureGrid";

describe("FeatureGrid", () => {
  it("renders", () => {
    const { container } = render(
      <FeatureGrid features={[{ title: "x", description: "y" }]} data-testid="root" />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <FeatureGrid asChild features={[{ title: "x", description: "y" }]} className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </FeatureGrid>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("max-w-7xl");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
