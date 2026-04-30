import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PricingPage } from "../../patterns/PricingPage";

describe("PricingPage", () => {
  it("renders", () => {
    const { container } = render(<PricingPage data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
