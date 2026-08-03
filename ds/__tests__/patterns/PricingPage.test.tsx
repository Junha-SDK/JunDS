import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PricingPage } from "../../patterns/PricingPage";

describe("PricingPage", () => {
  it("renders", () => {
    const { container } = render(
      <PricingPage
        monthlyPlans={[{ id: "a", name: "A", price: "$1", features: ["x"] }]}
        data-testid="root"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <PricingPage
        asChild
        monthlyPlans={[{ id: "a", name: "A", price: "$1", features: ["x"] }]}
        className="extra-class"
      >
        <a href="#" className="child">
          y
        </a>
      </PricingPage>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("max-w-6xl");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
