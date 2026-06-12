import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OnboardingTour } from "../../patterns/OnboardingTour";

describe("OnboardingTour", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<OnboardingTour open={false} steps={[]} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
