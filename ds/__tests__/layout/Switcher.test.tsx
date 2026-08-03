import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Switcher } from "@/ds/layout/Switcher";

describe("Switcher", () => {
  it("renders a wrapping flex container", () => {
    const { container } = render(
      <Switcher>
        <span>a</span>
        <span>b</span>
      </Switcher>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("flex");
    expect(el.style.flexWrap).toBe("wrap");
  });

  it("default threshold md resolves to 768px in each item's flex-basis", () => {
    const { container } = render(
      <Switcher>
        <span>a</span>
        <span>b</span>
      </Switcher>,
    );
    const item = container.firstElementChild!.firstElementChild as HTMLElement;
    // jsdom이 calc 항 순서를 정규화하므로 구성 요소만 단정한다
    expect(item.style.flexBasis).toContain("768px");
    expect(item.style.flexBasis).toContain("999");
    expect(item.style.flexGrow).toBe("1");
  });

  it("accepts a numeric px threshold", () => {
    const { container } = render(
      <Switcher threshold={480}>
        <span>a</span>
      </Switcher>,
    );
    const item = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(item.style.flexBasis).toContain("480px");
  });

  it("limit forces a column when the item count exceeds it", () => {
    const { container } = render(
      <Switcher limit={2}>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </Switcher>,
    );
    const item = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(item.style.flexBasis).toBe("100%");
  });

  it("keeps the row basis while the item count is within limit", () => {
    const { container } = render(
      <Switcher limit={3} threshold="sm">
        <span>a</span>
        <span>b</span>
      </Switcher>,
    );
    const item = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(item.style.flexBasis).toContain("640px");
  });
});
