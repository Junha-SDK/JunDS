import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BentoGrid } from "../../composites/BentoGrid";

describe("BentoGrid", () => {
  it("renders without throwing", () => {
    const { container } = render(<BentoGrid>{null}</BentoGrid>);
    expect(container.firstChild).toBeDefined();
  });
});
