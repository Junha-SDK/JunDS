import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CodeEditor } from "../../composites/CodeEditor";

describe("CodeEditor", () => {
  it("renders without throwing", () => {
    const { container } = render(<CodeEditor value="" />);
    expect(container.firstChild).toBeDefined();
  });
});
