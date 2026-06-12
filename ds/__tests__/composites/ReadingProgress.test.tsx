import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReadingProgress } from "../../composites/ReadingProgress";

describe("ReadingProgress", () => {
  it("renders", () => {
    const { container } = render(<ReadingProgress currentPage={10} totalPages={100} />);
    expect(container.firstChild).toBeTruthy();
  });
});
