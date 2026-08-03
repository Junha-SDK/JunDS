import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BentoGrid } from "../../composites/BentoGrid";

describe("BentoGrid", () => {
  it("renders without throwing", () => {
    const { container } = render(<BentoGrid>{null}</BentoGrid>);
    expect(container.firstChild).toBeDefined();
  });

  it("exposes Item as a compound member (createCompound)", () => {
    const { getByText } = render(
      <BentoGrid>
        <BentoGrid.Item colSpan={2}>카드</BentoGrid.Item>
      </BentoGrid>,
    );
    expect(getByText("카드")).toBeInTheDocument();
    expect(typeof BentoGrid.Item).not.toBe("undefined");
  });
});
