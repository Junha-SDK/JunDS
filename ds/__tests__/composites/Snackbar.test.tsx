import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Snackbar } from "../../composites/Snackbar";

describe("Snackbar", () => {
  it("renders", () => {
    const { container } = render(<Snackbar open message="hi" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
