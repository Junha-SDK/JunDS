import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PricingPage } from "../../patterns/PricingPage";

describe("PricingPage", () => {
  it("renders", () => {
    const { container } = render(
      <PricingPage
        monthlyPlans={[{ id: "a", name: "A", price: "$1", features: ["x"] }]}
        data-testid="root"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
