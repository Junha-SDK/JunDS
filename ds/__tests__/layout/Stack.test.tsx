import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stack, HStack, VStack } from "../../layout/Stack";

describe("Stack", () => {
  it("renders children", () => {
    render(<Stack><span>A</span><span>B</span></Stack>);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("defaults to vertical", () => {
    const { container } = render(<Stack>child</Stack>);
    expect(container.firstChild).toHaveClass("flex-col");
  });

  it("supports horizontal", () => {
    const { container } = render(<Stack direction="horizontal">child</Stack>);
    expect(container.firstChild).toHaveClass("flex-row");
  });

  it("applies gap", () => {
    const { container } = render(<Stack gap={6}>child</Stack>);
    expect(container.firstChild).toHaveClass("gap-6");
  });
});

describe("HStack", () => {
  it("renders horizontal", () => {
    const { container } = render(<HStack>child</HStack>);
    expect(container.firstChild).toHaveClass("flex-row");
  });
});

describe("VStack", () => {
  it("renders vertical", () => {
    const { container } = render(<VStack>child</VStack>);
    expect(container.firstChild).toHaveClass("flex-col");
  });
});
