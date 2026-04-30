import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComponentShowcase } from "../../composites/ComponentShowcase";

describe("ComponentShowcase", () => {
  it("renders without throwing", () => {
    const { container } = render(<ComponentShowcase items={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
