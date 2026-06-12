import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingButton } from "../../composites/LoadingButton";

describe("LoadingButton", () => {
  it("renders", () => {
    const { container } = render(<LoadingButton data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
