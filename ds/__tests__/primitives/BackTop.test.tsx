import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BackTop } from "../../primitives/BackTop";

describe("BackTop", () => {
  it("renders without throwing", () => {
    const { container } = render(<BackTop />);
    expect(container.firstChild).toBeDefined();
  });
});
