import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReactionPicker } from "../../composites/ReactionPicker";

describe("ReactionPicker", () => {
  it("renders", () => {
    const { container } = render(<ReactionPicker />);
    expect(container.firstChild).toBeTruthy();
  });
});
