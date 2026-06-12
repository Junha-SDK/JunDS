import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CommentThread } from "../../composites/CommentThread";

describe("CommentThread", () => {
  it("renders", () => {
    const { container } = render(
      <CommentThread comments={[{ id: "1", authorName: "유저", body: "댓글" }]} />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
