import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { KeyCap } from "../../primitives/KeyCap";

describe("KeyCap", () => {
  it("renders", () => {
    const { container } = render(<KeyCap>K</KeyCap>);
    expect(container.firstChild).toBeTruthy();
  });
});
