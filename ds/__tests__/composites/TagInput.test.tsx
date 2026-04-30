import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TagInput } from "../../composites/TagInput";

describe("TagInput", () => {
  it("renders without throwing", () => {
    const { container } = render(<TagInput value={[]} onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
