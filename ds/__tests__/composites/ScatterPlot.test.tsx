import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScatterPlot } from "../../composites/ScatterPlot";

describe("ScatterPlot", () => {
  it("renders", () => {
    const { container } = render(<ScatterPlot series={[{name:"a",data:[{x:1,y:2}]}]} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
