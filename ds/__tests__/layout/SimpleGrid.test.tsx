import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SimpleGrid } from "../../layout/SimpleGrid";

describe("SimpleGrid", () => {
  it("renders without throwing", () => {
    const { container } = render(<SimpleGrid />);
    expect(container.firstChild).toBeDefined();
  });
});
