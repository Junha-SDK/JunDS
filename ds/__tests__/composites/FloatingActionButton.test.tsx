import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FloatingActionButton } from "../../composites/FloatingActionButton";

describe("FloatingActionButton", () => {
  it("renders without throwing", () => {
    const { container } = render(<FloatingActionButton actions={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
