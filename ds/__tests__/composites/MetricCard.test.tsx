import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MetricCard } from "../../composites/MetricCard";

describe("MetricCard", () => {
  it("renders without throwing", () => {
    const { container } = render(<MetricCard label="" value="" />);
    expect(container.firstChild).toBeDefined();
  });
});
