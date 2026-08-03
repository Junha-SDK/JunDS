import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Dock } from "../../composites/Dock";

describe("Dock", () => {
  it("renders without throwing", () => {
    const { container } = render(<Dock>{null}</Dock>);
    expect(container.firstChild).toBeDefined();
  });

  it("exposes Item as a compound member (createCompound)", () => {
    const { getByRole } = render(
      <Dock>
        <Dock.Item label="홈">아이콘</Dock.Item>
      </Dock>,
    );
    expect(getByRole("button", { name: "홈" })).toBeInTheDocument();
  });
});
