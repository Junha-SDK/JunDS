import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Switch } from "../../primitives/Switch";

describe("Switch", () => {
  it("renders without throwing", () => {
    const { container } = render(<Switch checked={false} onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
