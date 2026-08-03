import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ButtonGroup } from "../../composites/ButtonGroup";

describe("ButtonGroup", () => {
  it("renders children", () => {
    render(
      <ButtonGroup>
        <button>A</button>
        <button>B</button>
      </ButtonGroup>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("has group role", () => {
    render(
      <ButtonGroup>
        <button>A</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("applies fullWidth", () => {
    const { container } = render(
      <ButtonGroup fullWidth>
        <button>A</button>
      </ButtonGroup>,
    );
    expect(container.firstChild).toHaveClass("w-full");
  });
});
