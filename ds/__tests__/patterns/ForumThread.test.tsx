import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ForumThread } from "../../patterns/ForumThread";

describe("ForumThread", () => {
  it("renders", () => {
    const { container } = render(
      <ForumThread
        title="React 19 use() 사용법"
        opening={{
          id: "op",
          authorName: "준하",
          body: "use 훅 어떻게 쓰나요?",
          createdAt: new Date(),
          upvotes: 5,
        }}
        answers={[
          {
            id: "a1",
            authorName: "지우",
            body: "이렇게 씁니다…",
            createdAt: new Date(),
            upvotes: 12,
            accepted: true,
          },
        ]}
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
