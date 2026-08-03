import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Watermark } from "../../composites/Watermark";

describe("Watermark", () => {
  it("renders without throwing", () => {
    const { container } = render(<Watermark text="">{null}</Watermark>);
    expect(container.firstChild).toBeDefined();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <Watermark asChild text="w" className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </Watermark>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("relative");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
