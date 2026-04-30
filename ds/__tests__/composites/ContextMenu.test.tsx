import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ContextMenu } from "../../composites/ContextMenu";

describe("ContextMenu", () => {
  it("renders without throwing", () => {
    const { container } = render(<ContextMenu items={[]}>{null}</ContextMenu>);
    expect(container.firstChild).toBeDefined();
  });
});
