import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReadingGoal } from "../../composites/ReadingGoal";

describe("ReadingGoal", () => {
  it("renders", () => {
    const { container } = render(<ReadingGoal current={20} target={50} />);
    expect(container.firstChild).toBeTruthy();
  });
});
