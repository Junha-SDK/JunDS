import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SegmentedControl } from "../../composites/SegmentedControl";

describe("SegmentedControl", () => {
  it("renders without throwing", () => {
    const { container } = render(<SegmentedControl options={[]} value="" onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
