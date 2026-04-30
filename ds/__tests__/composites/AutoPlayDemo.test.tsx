import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AutoPlayDemo } from "../../composites/AutoPlayDemo";

describe("AutoPlayDemo", () => {
  it("renders without throwing", () => {
    const { container } = render(<AutoPlayDemo frames={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
