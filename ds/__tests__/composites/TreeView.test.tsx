import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TreeView } from "../../composites/TreeView";

describe("TreeView", () => {
  it("renders without throwing", () => {
    const { container } = render(<TreeView nodes={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
