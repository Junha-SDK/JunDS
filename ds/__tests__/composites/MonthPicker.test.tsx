import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MonthPicker } from "../../composites/MonthPicker";

describe("MonthPicker", () => {
  it("renders", () => {
    const { container } = render(<MonthPicker data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
