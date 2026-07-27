import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GlobeWireframe } from "../../composites/GlobeWireframe";

describe("GlobeWireframe", () => {
  it("renders without throwing", () => {
    const { container } = render(<GlobeWireframe />);
    expect(container.firstChild).toBeDefined();
  });
});
