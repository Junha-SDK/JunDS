import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CompareSlider } from "../../composites/CompareSlider";

describe("CompareSlider", () => {
  it("renders without throwing", () => {
    const { container } = render(<CompareSlider before="" after="" />);
    expect(container.firstChild).toBeDefined();
  });
});
