import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TextareaAutosize } from "../../composites/TextareaAutosize";

describe("TextareaAutosize", () => {
  it("renders", () => {
    const { container } = render(<TextareaAutosize data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
