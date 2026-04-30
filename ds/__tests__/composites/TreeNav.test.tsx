import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TreeNav } from "../../composites/TreeNav";

describe("TreeNav", () => {
  it("renders without throwing", () => {
    const { container } = render(<TreeNav items={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
