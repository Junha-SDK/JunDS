import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Affix } from "../../composites/Affix";

describe("Affix", () => {
  it("renders without throwing", () => {
    const { container } = render(<Affix>{null}</Affix>);
    expect(container.firstChild).toBeDefined();
  });
});
