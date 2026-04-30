import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MasonryGrid } from "../../patterns/MasonryGrid";

describe("MasonryGrid", () => {
  it("renders without throwing", () => {
    const { container } = render(<MasonryGrid>{null}</MasonryGrid>);
    expect(container.firstChild).toBeDefined();
  });
});
