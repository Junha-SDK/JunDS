import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GaugeChart } from "../../composites/GaugeChart";

describe("GaugeChart", () => {
  it("renders without throwing", () => {
    const { container } = render(<GaugeChart value={0} />);
    expect(container.firstChild).toBeDefined();
  });
});
