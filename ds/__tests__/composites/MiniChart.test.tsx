import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MiniChart } from "../../composites/MiniChart";

describe("MiniChart", () => {
  it("renders without throwing", () => {
    const { container } = render(<MiniChart data={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
