import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { QuantitySelector } from "../../composites/QuantitySelector";

describe("QuantitySelector", () => {
  it("renders", () => {
    const { container } = render(<QuantitySelector data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
