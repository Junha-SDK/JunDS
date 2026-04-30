import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatsGrid } from "../../patterns/StatsGrid";

describe("StatsGrid", () => {
  it("renders without throwing", () => {
    const { container } = render(<StatsGrid stats={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
