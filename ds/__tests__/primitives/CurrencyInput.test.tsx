import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CurrencyInput } from "../../primitives/CurrencyInput";

describe("CurrencyInput", () => {
  it("renders without throwing", () => {
    const { container } = render(<CurrencyInput />);
    expect(container.firstChild).toBeDefined();
  });
});
