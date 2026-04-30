import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FocusGuard } from "../../primitives/FocusGuard";

describe("FocusGuard", () => {
  it("renders without throwing", () => {
    const { container } = render(<FocusGuard>{null}</FocusGuard>);
    expect(container.firstChild).toBeDefined();
  });
});
