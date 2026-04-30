import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OTPInput } from "../../primitives/OTPInput";

describe("OTPInput", () => {
  it("renders without throwing", () => {
    const { container } = render(<OTPInput />);
    expect(container.firstChild).toBeDefined();
  });
});
