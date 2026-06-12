import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Blockquote } from "../../composites/Blockquote";

describe("Blockquote", () => {
  it("renders", () => {
    const { container } = render(<Blockquote data-testid="root">x</Blockquote>);
    expect(container.firstChild).toBeTruthy();
  });
});
