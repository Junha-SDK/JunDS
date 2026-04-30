import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TimePicker } from "../../composites/TimePicker";

describe("TimePicker", () => {
  it("renders without throwing", () => {
    const { container } = render(<TimePicker onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
