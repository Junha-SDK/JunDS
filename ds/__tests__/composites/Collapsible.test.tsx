import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Collapsible } from "../../composites/Collapsible";

describe("Collapsible", () => {
  it("renders without throwing", () => {
    const { container } = render(<Collapsible trigger={null}>{null}</Collapsible>);
    expect(container.firstChild).toBeDefined();
  });
});
