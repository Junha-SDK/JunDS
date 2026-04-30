import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhoneInput } from "../../primitives/PhoneInput";

describe("PhoneInput", () => {
  it("renders without throwing", () => {
    const { container } = render(<PhoneInput />);
    expect(container.firstChild).toBeDefined();
  });
});
