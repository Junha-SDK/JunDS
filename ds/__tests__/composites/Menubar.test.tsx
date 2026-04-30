import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Menubar } from "../../composites/Menubar";

describe("Menubar", () => {
  it("renders without throwing", () => {
    const { container } = render(<Menubar items={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
