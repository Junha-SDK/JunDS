import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DateRangePicker } from "../../composites/DateRangePicker";

describe("DateRangePicker", () => {
  it("renders with empty range", () => {
    const { container } = render(
      <DateRangePicker value={{ start: null, end: null }} onChange={() => {}} />,
    );
    expect(container.firstChild).toBeDefined();
  });

  it("renders with a populated range", () => {
    const { container } = render(
      <DateRangePicker
        value={{ start: new Date("2026-01-01"), end: new Date("2026-01-10") }}
        onChange={() => {}}
      />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
