import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AreaChart } from "../../composites/AreaChart";

describe("AreaChart", () => {
  it("renders", () => {
    const { container } = render(
      <AreaChart series={[{ name: "a", data: [1, 2, 3] }]} data-testid="root" />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
