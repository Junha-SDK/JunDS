import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SpotlightCard } from "../../composites/SpotlightCard";

describe("SpotlightCard", () => {
  it("renders without throwing", () => {
    const { container } = render(<SpotlightCard>{null}</SpotlightCard>);
    expect(container.firstChild).toBeDefined();
  });
});
