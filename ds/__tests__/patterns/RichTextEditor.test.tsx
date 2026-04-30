import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RichTextEditor } from "../../patterns/RichTextEditor";

describe("RichTextEditor", () => {
  it("renders without throwing", () => {
    const { container } = render(<RichTextEditor />);
    expect(container.firstChild).toBeDefined();
  });
});
