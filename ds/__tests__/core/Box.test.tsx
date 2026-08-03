import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Box } from "@/ds/core/Box";

describe("Box — element type", () => {
  it("renders a div by default", () => {
    const { container } = render(<Box>hi</Box>);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("respects the `as` prop (polymorphism)", () => {
    const { container } = render(<Box as="section">hi</Box>);
    expect(container.firstElementChild?.tagName).toBe("SECTION");
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLElement>();
    render(<Box ref={ref}>hi</Box>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe("Box — style props", () => {
  it("resolves token-based padding to pixel values", () => {
    const { container } = render(<Box p={4} data-testid="b" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.padding).toBe("16px");
  });

  it("resolves color tokens to CSS variables", () => {
    const { container } = render(<Box bg="primary" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundColor).toBe("var(--primary)");
  });

  it("supports negative spacing", () => {
    const { container } = render(<Box mt={-2} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.marginTop).toBe("-8px");
  });

  it("merges user-provided inline style with resolved style props", () => {
    const { container } = render(<Box p={2} style={{ outline: "1px solid red" }} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.padding).toBe("8px");
    expect(el.style.outline).toBe("1px solid red");
  });
});

describe("Box — responsive props", () => {
  it("emits responsive CSS for breakpoint-keyed values", () => {
    const { container } = render(<Box p={{ base: 2, md: 4 }}>x</Box>);
    const styleTag = container.querySelector("style");
    expect(styleTag).not.toBeNull();
    const css = styleTag!.textContent ?? "";
    // base value lives on inline style, md value lives in @media query
    expect(css).toMatch(/@media\s*\(min-width:\s*768px\)/);
  });

  it("falls back to inline style when no responsive shape is present", () => {
    const { container } = render(<Box p={3} />);
    expect(container.querySelector("style")).toBeNull();
  });
});

describe("Box — HTML pass-through", () => {
  it("passes data-* and aria-* attributes through", () => {
    render(
      <Box data-testid="x" aria-label="thing">
        hi
      </Box>,
    );
    const el = screen.getByTestId("x");
    expect(el.getAttribute("aria-label")).toBe("thing");
  });

  it("does not leak style props onto the DOM", () => {
    const { container } = render(<Box p={2} bg="primary" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute("p")).toBe(false);
    expect(el.hasAttribute("bg")).toBe(false);
  });
});
