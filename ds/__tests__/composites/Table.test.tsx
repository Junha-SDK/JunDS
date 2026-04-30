import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Table } from "../../composites/Table";

describe("Table", () => {
  it("renders without throwing", () => {
    const { container } = render(<Table columns={[]} data={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
