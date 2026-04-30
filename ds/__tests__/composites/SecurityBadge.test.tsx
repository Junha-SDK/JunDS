import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { SecurityBadge } from "../../composites/SecurityBadge";

describe("SecurityBadge", () => {
  it("renders for every level without throwing", () => {
    for (const level of ["critical", "warning", "safe", "verified", "unverified"] as const) {
      const { unmount } = render(<SecurityBadge level={level} />);
      unmount();
    }
  });
});
