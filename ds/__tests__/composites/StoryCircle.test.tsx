import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StoryCircle } from "../../composites/StoryCircle";

describe("StoryCircle", () => {
  it("renders", () => {
    const { container } = render(<StoryCircle name="준하" />);
    expect(container.firstChild).toBeTruthy();
  });
});
