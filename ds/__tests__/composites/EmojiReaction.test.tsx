import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmojiReaction } from "../../composites/EmojiReaction";

describe("EmojiReaction", () => {
  it("renders", () => {
    const { container } = render(<EmojiReaction reactions={[{emoji:"👍",count:1}]} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
