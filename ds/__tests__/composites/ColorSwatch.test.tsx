import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ColorSwatch } from "../../composites/ColorSwatch";

describe("ColorSwatch", () => {
  it("renders without throwing", () => {
    const { container } = render(<ColorSwatch colors={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
