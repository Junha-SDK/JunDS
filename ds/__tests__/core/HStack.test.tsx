import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { HStack } from "@/ds/core/HStack";

describe("HStack", () => {
  it("renders a row flex container", () => {
    const { container } = render(<HStack>x</HStack>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("flex");
    expect(el.style.flexDirection).toBe("row");
  });

  it("defaults gap to sm (8px) and align to center", () => {
    const { container } = render(<HStack>x</HStack>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gap).toBe("8px");
    expect(el.style.alignItems).toBe("center");
  });

  it("accepts gap/align overrides", () => {
    const { container } = render(
      <HStack gap="md" align="start">
        x
      </HStack>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gap).toBe("16px");
    expect(el.style.alignItems).toBe("flex-start");
  });
});
