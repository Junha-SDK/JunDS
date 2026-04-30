import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Heatmap } from "../../composites/Heatmap";

describe("Heatmap", () => {
  it("renders without throwing", () => {
    const { container } = render(<Heatmap data={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
