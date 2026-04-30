import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ActionBar } from "../../patterns/ActionBar";

describe("ActionBar", () => {
  it("renders without throwing", () => {
    const { container } = render(<ActionBar count={0} open={false} actions={null} />);
    expect(container.firstChild).toBeDefined();
  });
});
