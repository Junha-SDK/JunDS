import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LineChart } from "../../composites/LineChart";

describe("LineChart", () => {
  it("renders", () => {
    const { container } = render(<LineChart series={[{name:"a",data:[1,2,3]}]} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
