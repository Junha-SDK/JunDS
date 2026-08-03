import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Form } from "../../patterns/Form";

describe("Form", () => {
  it("renders with empty values and child content", () => {
    const { container } = render(
      <Form values={{}} onChange={() => {}}>
        <input name="email" />
      </Form>,
    );
    expect(container.firstChild).toBeDefined();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <Form asChild values={{}} onChange={() => {}} className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </Form>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("space-y-4");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
