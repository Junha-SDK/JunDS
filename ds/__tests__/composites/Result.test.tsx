import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Result } from "../../composites/Result";

describe("Result", () => {
  it("renders title for each status", () => {
    for (const status of ["success", "warning", "info", "error", "404", "403"] as const) {
      const { unmount } = render(<Result status={status} title={`s-${status}`} />);
      expect(screen.getByText(`s-${status}`)).toBeDefined();
      unmount();
    }
  });
});
