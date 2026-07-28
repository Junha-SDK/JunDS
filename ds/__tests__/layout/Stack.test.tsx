import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stack, HStack, VStack } from "../../layout/Stack";

describe("Stack", () => {
  it("renders children", () => {
    render(
      <Stack>
        <span>A</span>
        <span>B</span>
      </Stack>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("defaults to vertical (column)", () => {
    const { container } = render(<Stack>child</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.flexDirection).toBe("column");
  });

  it("supports row direction", () => {
    const { container } = render(<Stack direction="row">child</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.flexDirection).toBe("row");
  });

  it("applies gap via style", () => {
    const { container } = render(<Stack gap={6}>child</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gap).toBe("24px");
  });
});

describe("HStack", () => {
  it("renders horizontal", () => {
    const { container } = render(<HStack>child</HStack>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.flexDirection).toBe("row");
  });
});

describe("VStack", () => {
  it("renders vertical", () => {
    const { container } = render(<VStack>child</VStack>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.flexDirection).toBe("column");
  });
});
