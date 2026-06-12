import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PieChart } from "../../composites/PieChart";

describe("PieChart", () => {
  it("renders", () => {
    const { container } = render(<PieChart data={[{label:"A",value:1}]} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
