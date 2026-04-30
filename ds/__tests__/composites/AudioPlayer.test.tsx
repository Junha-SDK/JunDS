import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AudioPlayer } from "../../composites/AudioPlayer";

describe("AudioPlayer", () => {
  it("renders without throwing", () => {
    const { container } = render(<AudioPlayer src="" />);
    expect(container.firstChild).toBeDefined();
  });
});
