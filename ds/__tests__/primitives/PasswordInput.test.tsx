import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PasswordInput } from "../../primitives/PasswordInput";

describe("PasswordInput", () => {
  it("renders without throwing", () => {
    const { container } = render(<PasswordInput />);
    expect(container.firstChild).toBeDefined();
  });
});
