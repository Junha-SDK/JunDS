import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Spotlight } from "../../composites/Spotlight";

describe("Spotlight", () => {
  it("renders without throwing", () => {
    const { container } = render(<Spotlight target="" active={false} />);
    expect(container.firstChild).toBeDefined();
  });
});
