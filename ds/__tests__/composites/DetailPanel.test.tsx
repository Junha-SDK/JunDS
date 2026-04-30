import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DetailPanel } from "../../composites/DetailPanel";

describe("DetailPanel", () => {
  it("renders without throwing", () => {
    const { container } = render(<DetailPanel open={false} onClose={() => {}} title="" />);
    expect(container.firstChild).toBeDefined();
  });
});
