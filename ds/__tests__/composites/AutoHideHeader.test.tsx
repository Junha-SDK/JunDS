import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AutoHideHeader } from "../../composites/AutoHideHeader";

describe("AutoHideHeader", () => {
  it("renders without throwing", () => {
    const { container } = render(<AutoHideHeader>{null}</AutoHideHeader>);
    expect(container.firstChild).toBeDefined();
  });
});
