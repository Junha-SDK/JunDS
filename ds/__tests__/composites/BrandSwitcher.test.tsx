import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrandSwitcher } from "../../composites/BrandSwitcher";

describe("BrandSwitcher", () => {
  it("renders", () => {
    const { container } = render(<BrandSwitcher data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
