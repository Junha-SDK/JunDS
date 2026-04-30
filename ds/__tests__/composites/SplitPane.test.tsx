import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SplitPane } from "../../composites/SplitPane";

describe("SplitPane", () => {
  it("renders without throwing", () => {
    const { container } = render(<SplitPane left={null} right={null} />);
    expect(container.firstChild).toBeDefined();
  });
});
