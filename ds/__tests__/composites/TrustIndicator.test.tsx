import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TrustIndicator } from "../../composites/TrustIndicator";

describe("TrustIndicator", () => {
  it("renders without throwing", () => {
    const { container } = render(<TrustIndicator items={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
