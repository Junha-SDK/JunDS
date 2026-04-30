import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ErrorBoundary } from "../../primitives/ErrorBoundary";

describe("ErrorBoundary", () => {
  it("renders without throwing", () => {
    const { container } = render(<ErrorBoundary>{null}</ErrorBoundary>);
    expect(container.firstChild).toBeDefined();
  });
});
