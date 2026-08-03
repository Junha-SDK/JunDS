import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VStack } from "@/ds/core/VStack";

describe("VStack", () => {
  it("renders a column flex container", () => {
    const { container } = render(<VStack>x</VStack>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("flex");
    expect(el.style.flexDirection).toBe("column");
  });

  it("defaults gap to md (16px)", () => {
    const { container } = render(<VStack>x</VStack>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gap).toBe("16px");
  });

  it("accepts a gap override", () => {
    const { container } = render(<VStack gap="sm">x</VStack>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gap).toBe("8px");
  });
});
