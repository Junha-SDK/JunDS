import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductCard } from "../../composites/ProductCard";

describe("ProductCard", () => {
  it("renders", () => {
    const { container } = render(<ProductCard title="t" price="₩1,000" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
