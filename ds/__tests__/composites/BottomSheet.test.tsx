import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BottomSheet } from "../../composites/BottomSheet";

describe("BottomSheet", () => {
  it("renders without throwing", () => {
    const { container } = render(<BottomSheet open={false} onClose={() => {}}>{null}</BottomSheet>);
    expect(container.firstChild).toBeDefined();
  });
});
