import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Transfer } from "../../composites/Transfer";

describe("Transfer", () => {
  it("renders without throwing", () => {
    const { container } = render(<Transfer source={[]} target={[]} onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
