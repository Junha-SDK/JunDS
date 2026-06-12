import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChapterList } from "../../composites/ChapterList";

describe("ChapterList", () => {
  it("renders", () => {
    const { container } = render(<ChapterList chapters={[{ id: "a", title: "1장" }]} />);
    expect(container.firstChild).toBeTruthy();
  });
});
