import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Tooltip } from "../../composites/Tooltip";

describe("Tooltip", () => {
  it("renders without throwing", () => {
    const { container } = render(<Tooltip content={null}>{null}</Tooltip>);
    expect(container.firstChild).toBeDefined();
  });
});
