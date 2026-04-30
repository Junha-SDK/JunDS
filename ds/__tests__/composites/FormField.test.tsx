import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormField } from "../../composites/FormField";

describe("FormField", () => {
  it("renders without throwing", () => {
    const { container } = render(<FormField>{null}</FormField>);
    expect(container.firstChild).toBeDefined();
  });
});
