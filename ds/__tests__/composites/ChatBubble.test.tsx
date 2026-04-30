import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChatBubble } from "../../composites/ChatBubble";

describe("ChatBubble", () => {
  it("renders without throwing", () => {
    const { container } = render(<ChatBubble>{null}</ChatBubble>);
    expect(container.firstChild).toBeDefined();
  });
});
