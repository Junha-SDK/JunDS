import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DiffViewer } from "../../composites/DiffViewer";

describe("DiffViewer", () => {
  it("renders without throwing", () => {
    const { container } = render(<DiffViewer oldText="" newText="" />);
    expect(container.firstChild).toBeDefined();
  });
});
