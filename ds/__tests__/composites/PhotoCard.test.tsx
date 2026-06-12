import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhotoCard } from "../../composites/PhotoCard";

describe("PhotoCard", () => {
  it("renders", () => {
    const { container } = render(<PhotoCard src="/p.jpg" alt="사진" />);
    expect(container.firstChild).toBeTruthy();
  });
});
