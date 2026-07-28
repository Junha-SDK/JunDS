import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FeatureGrid } from "../../patterns/FeatureGrid";

describe("FeatureGrid", () => {
  it("renders", () => {
    const { container } = render(
      <FeatureGrid features={[{ title: "x", description: "y" }]} data-testid="root" />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
