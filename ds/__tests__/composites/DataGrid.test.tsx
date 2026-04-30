import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DataGrid } from "../../composites/DataGrid";

describe("DataGrid", () => {
  it("renders without throwing", () => {
    const { container } = render(<DataGrid data={[]} columns={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
