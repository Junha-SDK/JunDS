import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PriceDisplay } from "../../composites/PriceDisplay";

describe("PriceDisplay", () => {
  it("renders", () => {
    const { container } = render(<PriceDisplay value={29000} currency="KRW" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
