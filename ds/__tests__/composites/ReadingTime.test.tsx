import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReadingTime } from "../../composites/ReadingTime";

describe("ReadingTime", () => {
  it("renders without throwing", () => {
    const { container } = render(<ReadingTime content="" />);
    expect(container.firstChild).toBeDefined();
  });
});
