import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VideoPlayer } from "../../composites/VideoPlayer";

describe("VideoPlayer", () => {
  it("renders without throwing", () => {
    const { container } = render(<VideoPlayer src="" />);
    expect(container.firstChild).toBeDefined();
  });
});
