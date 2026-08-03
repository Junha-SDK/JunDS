import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PasswordStrength } from "../../composites/PasswordStrength";

describe("PasswordStrength", () => {
  it("renders", () => {
    const { container } = render(<PasswordStrength password="Abc123" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <PasswordStrength asChild password="Abc123" className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </PasswordStrength>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("w-full");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
