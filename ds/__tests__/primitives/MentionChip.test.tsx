import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MentionChip } from "../../primitives/MentionChip";

describe("MentionChip", () => {
  it("renders", () => {
    const { container } = render(<MentionChip handle="junha" />);
    expect(container.firstChild).toBeTruthy();
  });
});
