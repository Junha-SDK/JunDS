import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { SkeletonPreset } from "../../composites/SkeletonPreset";

describe("SkeletonPreset", () => {
  it("renders every variant without throwing", () => {
    for (const variant of ["list", "card", "table", "profile", "article"] as const) {
      const { unmount } = render(<SkeletonPreset variant={variant} />);
      unmount();
    }
  });
});
