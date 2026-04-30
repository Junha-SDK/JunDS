import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Flex } from "@/ds/core/Flex";

describe("Flex", () => {
  it("renders a div with display: flex by default", () => {
    const { container } = render(<Flex>x</Flex>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("flex");
  });

  it("uses inline-flex when inline is true", () => {
    const { container } = render(<Flex inline>x</Flex>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("inline-flex");
  });

  it("defaults flex-direction to row", () => {
    const { container } = render(<Flex>x</Flex>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.flexDirection).toBe("row");
  });

  it("respects an explicit direction prop", () => {
    const { container } = render(<Flex direction="column">x</Flex>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.flexDirection).toBe("column");
  });

  it("forwards style props (gap) to Box", () => {
    const { container } = render(<Flex gap={4}>x</Flex>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gap).toBe("16px");
  });
});
