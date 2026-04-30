import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Resizable } from "../../composites/Resizable";

describe("Resizable", () => {
  it("renders both panels", () => {
    render(
      <Resizable>
        <div>left-pane</div>
        <div>right-pane</div>
      </Resizable>,
    );
    expect(screen.getByText("left-pane")).toBeDefined();
    expect(screen.getByText("right-pane")).toBeDefined();
  });
});
