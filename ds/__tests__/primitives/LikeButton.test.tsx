import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LikeButton } from "../../primitives/LikeButton";

describe("LikeButton", () => {
  it("renders", () => {
    const { container } = render(<LikeButton liked={false} onChange={() => {}} />);
    expect(container.firstChild).toBeTruthy();
  });
});
