import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ActionSheet } from "../../composites/ActionSheet";

describe("ActionSheet", () => {
  it("renders without throwing", () => {
    const { container } = render(<ActionSheet open={false} onClose={() => {}} actions={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
