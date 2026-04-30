import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Onboarding } from "../../composites/Onboarding";

describe("Onboarding", () => {
  it("renders without throwing", () => {
    const { container } = render(<Onboarding steps={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
