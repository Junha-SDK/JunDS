import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "@/ds/core/Heading";

describe("Heading", () => {
  it("renders an h2 by default", () => {
    const { container } = render(<Heading>Title</Heading>);
    expect(container.firstElementChild?.tagName).toBe("H2");
  });

  it("renders the correct tag for level 1..6", () => {
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      const { container, unmount } = render(
        <Heading level={level}>x</Heading>,
      );
      expect(container.firstElementChild?.tagName).toBe(`H${level}`);
      unmount();
    }
  });

  it("uppercases level-6 headings", () => {
    const { container } = render(<Heading level={6}>x</Heading>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.textTransform).toBe("uppercase");
  });

  it("applies tight letter-spacing for level <= 2", () => {
    const { container } = render(<Heading level={1}>x</Heading>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.letterSpacing).toBe("-0.025em");
  });

  it("does not tight-letter-space level >= 3", () => {
    const { container } = render(<Heading level={3}>x</Heading>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.letterSpacing).toBe("");
  });

  it("appends 'truncate' class when truncate is true", () => {
    render(
      <Heading truncate level={2}>
        Long
      </Heading>,
    );
    expect(screen.getByText("Long").className).toContain("truncate");
  });

  it("renders the children", () => {
    render(<Heading level={3}>Welcome</Heading>);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Welcome",
    );
  });
});
