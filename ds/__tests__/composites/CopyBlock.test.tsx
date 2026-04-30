import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CopyBlock } from "../../composites/CopyBlock";

describe("CopyBlock", () => {
  it("renders without throwing", () => {
    const { container } = render(<CopyBlock code="" />);
    expect(container.firstChild).toBeDefined();
  });
});
