import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComparisonGrid } from "../../composites/ComparisonGrid";

describe("ComparisonGrid", () => {
  it("renders without throwing", () => {
    const { container } = render(<ComparisonGrid cards={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
