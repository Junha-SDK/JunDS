import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { KeyValueGrid } from "../../composites/KeyValueGrid";

describe("KeyValueGrid", () => {
  it("renders without throwing", () => {
    const { container } = render(<KeyValueGrid items={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
