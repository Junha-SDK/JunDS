import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TreemapChart } from "../../composites/TreemapChart";

describe("TreemapChart", () => {
  it("renders without throwing", () => {
    const { container } = render(<TreemapChart data={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
