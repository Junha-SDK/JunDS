import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Dropdown } from "../../composites/Dropdown";

describe("Dropdown", () => {
  it("renders without throwing", () => {
    const { container } = render(<Dropdown trigger={null} items={[]} onSelect={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
