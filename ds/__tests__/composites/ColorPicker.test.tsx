import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ColorPicker } from "../../composites/ColorPicker";

describe("ColorPicker", () => {
  it("renders without throwing", () => {
    const { container } = render(<ColorPicker value="" onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
