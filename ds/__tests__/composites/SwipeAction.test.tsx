import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SwipeAction } from "../../composites/SwipeAction";

describe("SwipeAction", () => {
  it("renders without throwing", () => {
    const { container } = render(<SwipeAction>{null}</SwipeAction>);
    expect(container.firstChild).toBeDefined();
  });
});
