import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FollowButton } from "../../primitives/FollowButton";

describe("FollowButton", () => {
  it("renders", () => {
    const { container } = render(<FollowButton following={false} onChange={() => {}} />);
    expect(container.firstChild).toBeTruthy();
  });
});
