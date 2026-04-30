import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stepper } from "../../composites/Stepper";

describe("Stepper", () => {
  it("renders without throwing", () => {
    const { container } = render(<Stepper steps={[]} current={0} />);
    expect(container.firstChild).toBeDefined();
  });
});
