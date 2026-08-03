import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductCard } from "../../composites/ProductCard";

describe("ProductCard", () => {
  it("renders", () => {
    const { container } = render(<ProductCard title="t" price="₩1,000" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <ProductCard asChild title="t" price="₩1,000" className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </ProductCard>,
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
