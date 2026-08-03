import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AppShell } from "../../layout/AppShell";

describe("AppShell", () => {
  it("renders without throwing", () => {
    const { container } = render(<AppShell>{null}</AppShell>);
    expect(container.firstChild).toBeDefined();
  });
});
