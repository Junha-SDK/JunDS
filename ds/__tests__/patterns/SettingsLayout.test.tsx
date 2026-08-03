import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SettingsLayout } from "../../patterns/SettingsLayout";

describe("SettingsLayout", () => {
  it("renders", () => {
    const { container } = render(
      <SettingsLayout
        sections={[{ id: "a", label: "A", content: <div>x</div> }]}
        data-testid="root"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <SettingsLayout
        asChild
        sections={[{ id: "a", label: "A", content: <div>x</div> }]}
        className="extra-class"
      >
        <a href="#" className="child">
          y
        </a>
      </SettingsLayout>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("min-h-[480px]");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
