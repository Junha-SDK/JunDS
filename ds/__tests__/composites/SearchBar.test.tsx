import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SearchBar } from "../../composites/SearchBar";

describe("SearchBar", () => {
  it("renders", () => {
    const { container } = render(<SearchBar placeholder="검색" />);
    expect(container.firstChild).toBeTruthy();
  });
});
