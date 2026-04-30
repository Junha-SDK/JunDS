import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GanttChart } from "../../patterns/GanttChart";

describe("GanttChart", () => {
  it("renders", () => {
    const { container } = render(<GanttChart data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
