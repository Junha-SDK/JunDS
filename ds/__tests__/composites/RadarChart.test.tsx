import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RadarChart } from "../../composites/RadarChart";

describe("RadarChart", () => {
  it("renders", () => {
    const { container } = render(<RadarChart axes={["A","B","C"]} series={[{name:"x",data:[1,2,3]}]} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
