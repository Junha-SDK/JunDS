import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingOverlay } from "../../composites/LoadingOverlay";

describe("LoadingOverlay", () => {
  it("renders without throwing", () => {
    const { container } = render(<LoadingOverlay active={false}>{null}</LoadingOverlay>);
    expect(container.firstChild).toBeDefined();
  });
});
