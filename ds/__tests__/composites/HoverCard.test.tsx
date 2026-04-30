import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HoverCard } from "../../composites/HoverCard";

describe("HoverCard", () => {
  it("renders without throwing", () => {
    const { container } = render(<HoverCard trigger={null}>{null}</HoverCard>);
    expect(container.firstChild).toBeDefined();
  });
});
