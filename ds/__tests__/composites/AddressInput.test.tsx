import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AddressInput } from "../../composites/AddressInput";

describe("AddressInput", () => {
  it("renders without throwing", () => {
    const { container } = render(<AddressInput />);
    expect(container.firstChild).toBeDefined();
  });
});
