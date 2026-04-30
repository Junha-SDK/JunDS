import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MultiSelect } from "../../composites/MultiSelect";

describe("MultiSelect", () => {
  it("renders without throwing", () => {
    const { container } = render(<MultiSelect options={[]} value={[]} onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
