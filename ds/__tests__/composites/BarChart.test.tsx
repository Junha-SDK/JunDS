import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BarChart } from "../../composites/BarChart";

describe("BarChart", () => {
  it("renders", () => {
    const { container } = render(<BarChart labels={["A"]} series={[{name:"x",data:[1]}]} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
