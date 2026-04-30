import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AutoComplete } from "../../composites/AutoComplete";

describe("AutoComplete", () => {
  it("renders without throwing", () => {
    const { container } = render(<AutoComplete value="" onChange={() => {}} options={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
