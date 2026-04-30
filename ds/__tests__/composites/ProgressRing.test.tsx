import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressRing } from "../../composites/ProgressRing";

describe("ProgressRing", () => {
  it("renders without throwing", () => {
    const { container } = render(<ProgressRing value={0} />);
    expect(container.firstChild).toBeDefined();
  });
});
