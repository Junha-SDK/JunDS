import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhotoGrid } from "../../composites/PhotoGrid";

describe("PhotoGrid", () => {
  it("renders", () => {
    const { container } = render(
      <PhotoGrid>
        <div>1</div>
        <div>2</div>
      </PhotoGrid>,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <PhotoGrid asChild className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </PhotoGrid>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("grid");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 div 가 생기지 않는다
    expect(container.querySelector("div")).toBeNull();
    expect(root?.parentElement).toBe(container);
  });
});
