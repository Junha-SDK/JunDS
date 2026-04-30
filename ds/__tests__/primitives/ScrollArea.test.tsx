import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScrollArea } from "../../primitives/ScrollArea";

describe("ScrollArea", () => {
  it("renders without throwing", () => {
    const { container } = render(<ScrollArea>{null}</ScrollArea>);
    expect(container.firstChild).toBeDefined();
  });
});
