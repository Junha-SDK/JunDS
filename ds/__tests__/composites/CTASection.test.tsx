import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CTASection } from "../../composites/CTASection";

describe("CTASection", () => {
  it("renders", () => {
    const { container } = render(<CTASection title="t" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
