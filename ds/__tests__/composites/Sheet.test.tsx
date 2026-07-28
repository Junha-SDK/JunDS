import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Sheet } from "../../composites/Sheet";

describe("Sheet", () => {
  it("renders without throwing", () => {
    const { container } = render(
      <Sheet open={false} onClose={() => {}}>
        {null}
      </Sheet>,
    );
    expect(container.firstChild).toBeDefined();
  });
});
