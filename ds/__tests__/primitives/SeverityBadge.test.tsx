import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SeverityBadge } from "../../primitives/SeverityBadge";

describe("SeverityBadge", () => {
  it("renders the supplied label", () => {
    render(<SeverityBadge severity="ok">Healthy</SeverityBadge>);
    expect(screen.getByText("Healthy")).toBeDefined();
  });

  it("accepts each known severity without throwing", () => {
    for (const severity of ["ok", "warn", "danger", "info", "neutral"] as const) {
      const { unmount } = render(<SeverityBadge severity={severity}>x</SeverityBadge>);
      unmount();
    }
  });
});
