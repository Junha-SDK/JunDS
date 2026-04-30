import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnimatedCounter } from "../../composites/AnimatedCounter";

describe("AnimatedCounter", () => {
  it("renders without throwing", () => {
    const { container } = render(<AnimatedCounter value={0} />);
    expect(container.firstChild).toBeDefined();
  });
});
