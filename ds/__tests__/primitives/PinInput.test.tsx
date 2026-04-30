import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PinInput } from "../../primitives/PinInput";

describe("PinInput", () => {
  it("renders without throwing", () => {
    const { container } = render(<PinInput />);
    expect(container.firstChild).toBeDefined();
  });
});
