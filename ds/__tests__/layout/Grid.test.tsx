import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Grid } from "../../layout/Grid";

describe("Grid", () => {
  it("renders without throwing", () => {
    const { container } = render(<Grid />);
    expect(container.firstChild).toBeDefined();
  });
});
