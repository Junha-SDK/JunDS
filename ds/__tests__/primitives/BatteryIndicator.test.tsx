import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BatteryIndicator } from "../../primitives/BatteryIndicator";

describe("BatteryIndicator", () => {
  it("renders without throwing", () => {
    const { container } = render(<BatteryIndicator value={0} />);
    expect(container.firstChild).toBeDefined();
  });
});
