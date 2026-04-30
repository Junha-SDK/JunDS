import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Mention } from "../../composites/Mention";

describe("Mention", () => {
  it("renders without throwing", () => {
    const { container } = render(<Mention value="" onChange={() => {}} users={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
