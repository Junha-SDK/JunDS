import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingScreen } from "../../composites/LoadingScreen";

describe("LoadingScreen", () => {
  it("renders", () => {
    const { container } = render(<LoadingScreen data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
