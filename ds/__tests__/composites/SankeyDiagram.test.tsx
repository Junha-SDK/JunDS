import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SankeyDiagram } from "../../composites/SankeyDiagram";

describe("SankeyDiagram", () => {
  it("renders", () => {
    const { container } = render(
      <SankeyDiagram
        nodes={[{ id: "A" }, { id: "B" }]}
        links={[{ source: "A", target: "B", value: 5 }]}
        data-testid="root"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
