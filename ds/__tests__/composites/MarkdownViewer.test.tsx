import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MarkdownViewer } from "../../composites/MarkdownViewer";

describe("MarkdownViewer", () => {
  it("renders without throwing", () => {
    const { container } = render(<MarkdownViewer content="" />);
    expect(container.firstChild).toBeDefined();
  });
});
