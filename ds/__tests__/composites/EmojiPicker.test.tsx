import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmojiPicker } from "../../composites/EmojiPicker";

describe("EmojiPicker", () => {
  it("renders without throwing", () => {
    const { container } = render(<EmojiPicker onSelect={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
