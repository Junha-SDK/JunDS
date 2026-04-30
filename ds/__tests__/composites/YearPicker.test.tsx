import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { YearPicker } from "../../composites/YearPicker";

describe("YearPicker", () => {
  it("renders", () => {
    const { container } = render(<YearPicker data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
