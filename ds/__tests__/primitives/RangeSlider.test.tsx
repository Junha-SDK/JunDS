import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RangeSlider } from "../../primitives/RangeSlider";

describe("RangeSlider", () => {
  it("renders without throwing", () => {
    const { container } = render(<RangeSlider value={[0, 0]} onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
