import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Portal } from "../../primitives/Portal";

describe("Portal", () => {
  it("renders without throwing", () => {
    const { container } = render(<Portal>{null}</Portal>);
    expect(container.firstChild).toBeDefined();
  });
});
