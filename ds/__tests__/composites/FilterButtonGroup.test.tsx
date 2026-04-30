import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FilterButtonGroup } from "../../composites/FilterButtonGroup";

describe("FilterButtonGroup", () => {
  it("renders without throwing", () => {
    const { container } = render(<FilterButtonGroup options={[]} value="" onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
