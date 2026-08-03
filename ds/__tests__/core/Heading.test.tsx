import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "@/ds/core/Heading";

describe("Heading", () => {
  it("renders an h2 by default", () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Title");
  });

  it("renders the correct tag for level 1..6", () => {
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      const { unmount } = render(<Heading level={level}>x</Heading>);
      expect(screen.getByRole("heading", { level })).toBeInTheDocument();
      unmount();
    }
  });

  it("uppercases level-6 headings", () => {
    render(<Heading level={6}>x</Heading>);
    const el = screen.getByRole("heading", { level: 6 });
    expect(el.style.textTransform).toBe("uppercase");
  });

  it("applies tight letter-spacing for level <= 2", () => {
    render(<Heading level={1}>x</Heading>);
    const el = screen.getByRole("heading", { level: 1 });
    expect(el.style.letterSpacing).toBe("-0.025em");
  });

  it("does not tight-letter-space level >= 3", () => {
    render(<Heading level={3}>x</Heading>);
    const el = screen.getByRole("heading", { level: 3 });
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
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Welcome");
  });
});
