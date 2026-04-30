import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Descriptions } from "../../composites/Descriptions";

describe("Descriptions", () => {
  it("renders without throwing", () => {
    const { container } = render(<Descriptions items={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
