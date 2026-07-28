import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { Slot } from "../../utils/Slot";

describe("Slot", () => {
  it("renders the single child element in place of itself", () => {
    const { container } = render(
      <Slot>
        <a href="/x">link</a>
      </Slot>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe("A");
    expect(root.getAttribute("href")).toBe("/x");
  });

  it("merges className via tailwind-merge so child wins on conflicts", () => {
    const { container } = render(
      <Slot className="text-red-500 px-2">
        <a href="#" className="text-blue-500">
          link
        </a>
      </Slot>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("px-2");
    expect(root.className).toContain("text-blue-500");
    expect(root.className).not.toContain("text-red-500");
  });

  it("forwards a ref to the child DOM node", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Slot ref={ref}>
        <button type="button">click</button>
      </Slot>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("runs slot handler then child handler in sequence", () => {
    const order: string[] = [];
    const slotClick = vi.fn(() => order.push("slot"));
    const childClick = vi.fn(() => order.push("child"));
    const { container } = render(
      <Slot onClick={slotClick}>
        <button type="button" onClick={childClick}>
          x
        </button>
      </Slot>,
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(slotClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["slot", "child"]);
  });

  it("returns null when child is not a valid React element (warns in dev)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Slot>{"plain string"}</Slot>);
    expect(container.firstChild).toBeNull();
    warn.mockRestore();
  });

  it("merges inline styles with child taking precedence on conflicts", () => {
    const { container } = render(
      <Slot style={{ color: "red", padding: 4 }}>
        <span style={{ color: "blue" }}>txt</span>
      </Slot>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.color).toBe("blue");
    expect(root.style.padding).toBe("4px");
  });
});
