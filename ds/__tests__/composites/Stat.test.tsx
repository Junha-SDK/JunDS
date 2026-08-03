import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stat } from "../../composites/Stat";

describe("Stat", () => {
  it("renders", () => {
    const { container } = render(<Stat label="x" value="1" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild 로 자식 엘리먼트가 root 가 되고 className 이 병합된다", () => {
    const { container } = render(
      <Stat asChild className="extra" label="x" value="1">
        <a href="#" className="child">
          y
        </a>
      </Stat>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("A");
    expect(container.children).toHaveLength(1);
    expect(root.className).toContain("extra");
    expect(root.className).toContain("child");
  });
});
