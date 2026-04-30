import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SearchInput } from "../../composites/SearchInput";

describe("SearchInput", () => {
  it("renders without throwing", () => {
    const { container } = render(<SearchInput />);
    expect(container.firstChild).toBeDefined();
  });
});
