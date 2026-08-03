import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingOverlay } from "../../composites/LoadingOverlay";

describe("LoadingOverlay", () => {
  it("renders without throwing", () => {
    const { container } = render(<LoadingOverlay active={false}>{null}</LoadingOverlay>);
    expect(container.firstChild).toBeDefined();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <LoadingOverlay asChild active className="extra-class">
        <a href="#">y</a>
      </LoadingOverlay>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("relative");
    expect(root?.className).toContain("extra-class");
    // 래퍼 div 는 안 생기고, 오버레이는 위임된 root 안에 렌더된다
    expect(container.firstElementChild?.parentElement).toBe(container);
    expect(root?.querySelector('[role="status"]')).toBeTruthy();
  });
});
