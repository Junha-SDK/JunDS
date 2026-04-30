import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FlowDiagram } from "../../patterns/FlowDiagram";

describe("FlowDiagram", () => {
  it("renders without throwing", () => {
    const { container } = render(<FlowDiagram nodes={[]} connections={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
