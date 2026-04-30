import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Popover } from "../../composites/Popover";

describe("Popover", () => {
  it("renders without throwing", () => {
    const { container } = render(<Popover trigger={null} content={null} />);
    expect(container.firstChild).toBeDefined();
  });
});
