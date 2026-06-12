import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BookmarkButton } from "../../primitives/BookmarkButton";

describe("BookmarkButton", () => {
  it("renders", () => {
    const { container } = render(<BookmarkButton bookmarked={false} onChange={() => {}} />);
    expect(container.firstChild).toBeTruthy();
  });
});
