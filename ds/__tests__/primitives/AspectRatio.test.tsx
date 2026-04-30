import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AspectRatio } from "../../primitives/AspectRatio";

describe("AspectRatio", () => {
  it("renders without throwing", () => {
    const { container } = render(<AspectRatio>{null}</AspectRatio>);
    expect(container.firstChild).toBeDefined();
  });
});
