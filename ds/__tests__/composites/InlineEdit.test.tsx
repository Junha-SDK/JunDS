import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InlineEdit } from "../../composites/InlineEdit";

describe("InlineEdit", () => {
  it("renders without throwing", () => {
    const { container } = render(<InlineEdit value="" onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
