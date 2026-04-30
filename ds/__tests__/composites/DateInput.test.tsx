import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DateInput } from "../../composites/DateInput";

describe("DateInput", () => {
  it("renders without throwing", () => {
    const { container } = render(<DateInput />);
    expect(container.firstChild).toBeDefined();
  });
});
