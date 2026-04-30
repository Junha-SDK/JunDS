import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CommandPalette } from "../../patterns/CommandPalette";

describe("CommandPalette", () => {
  it("renders without throwing", () => {
    const { container } = render(<CommandPalette items={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
