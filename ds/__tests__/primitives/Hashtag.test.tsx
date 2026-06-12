import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Hashtag } from "../../primitives/Hashtag";

describe("Hashtag", () => {
  it("renders", () => {
    const { container } = render(<Hashtag tag="design" />);
    expect(container.firstChild).toBeTruthy();
  });
});
