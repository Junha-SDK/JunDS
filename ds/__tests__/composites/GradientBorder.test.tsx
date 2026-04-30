import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GradientBorder } from "../../composites/GradientBorder";

describe("GradientBorder", () => {
  it("renders without throwing", () => {
    const { container } = render(<GradientBorder>{null}</GradientBorder>);
    expect(container.firstChild).toBeDefined();
  });
});
