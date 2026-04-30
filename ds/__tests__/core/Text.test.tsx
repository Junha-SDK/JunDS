import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text } from "@/ds/core/Text";

describe("Text", () => {
  it("renders a <p> by default", () => {
    const { container } = render(<Text>hi</Text>);
    expect(container.firstElementChild?.tagName).toBe("P");
  });

  it("respects the `as` prop", () => {
    const { container } = render(<Text as="span">hi</Text>);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("applies font-mono class when mono is true", () => {
    render(<Text mono>code</Text>);
    expect(screen.getByText("code").className).toContain("font-mono");
  });

  it("applies truncate class when truncate is true", () => {
    render(<Text truncate>x</Text>);
    expect(screen.getByText("x").className).toContain("truncate");
  });

  it("uses muted color when dimmed is true", () => {
    const { container } = render(<Text dimmed>x</Text>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe("var(--muted)");
  });

  it("sets webkit line-clamp styles when lineClamp is provided", () => {
    const { container } = render(<Text lineClamp={3}>x</Text>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("-webkit-box");
    expect(el.style.overflow).toBe("hidden");
    expect((el.style as unknown as Record<string, string>)["webkitLineClamp"]).toBe(
      "3",
    );
  });

  it("preserves user className alongside variant classes", () => {
    render(
      <Text mono className="my-class">
        hello
      </Text>,
    );
    const el = screen.getByText("hello");
    expect(el.className).toContain("font-mono");
    expect(el.className).toContain("my-class");
  });
});
