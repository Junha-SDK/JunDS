import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PostCard } from "../../composites/PostCard";

describe("PostCard", () => {
  it("renders", () => {
    const { container } = render(<PostCard author={{ name: "준하" }} content="안녕" />);
    expect(container.firstChild).toBeTruthy();
  });
});
