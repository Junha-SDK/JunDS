import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChatThread } from "../../patterns/ChatThread";

describe("ChatThread", () => {
  it("renders with messages", () => {
    const { container } = render(
      <ChatThread
        currentUserId="me"
        messages={[
          { id: "1", authorId: "me", authorName: "준하", body: "안녕", createdAt: new Date() },
          { id: "2", authorId: "u2", authorName: "지우", body: "반가워", createdAt: new Date() },
        ]}
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
