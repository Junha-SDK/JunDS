import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SocialFeed } from "../../patterns/SocialFeed";

describe("SocialFeed", () => {
  it("renders empty state", () => {
    const { container } = render(<SocialFeed>{[]}</SocialFeed>);
    expect(container.firstChild).toBeTruthy();
  });
});
