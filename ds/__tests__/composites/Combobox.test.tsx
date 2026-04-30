import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Combobox } from "../../composites/Combobox";

describe("Combobox", () => {
  it("renders without throwing", () => {
    const { container } = render(<Combobox options={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
