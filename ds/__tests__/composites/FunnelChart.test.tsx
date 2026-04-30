import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FunnelChart } from "../../composites/FunnelChart";

describe("FunnelChart", () => {
  it("renders without throwing", () => {
    const { container } = render(<FunnelChart data={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
