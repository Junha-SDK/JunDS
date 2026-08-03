import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PricingTable } from "../../composites/PricingTable";

describe("PricingTable", () => {
  it("renders", () => {
    const { container } = render(
      <PricingTable
        plans={[{ id: "a", name: "A", price: "$1", features: ["x"] }]}
        data-testid="root"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <PricingTable
        asChild
        plans={[{ id: "a", name: "A", price: "$1", features: ["x"] }]}
        className="extra-class"
      >
        <a href="#" className="child">
          y
        </a>
      </PricingTable>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("grid");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
