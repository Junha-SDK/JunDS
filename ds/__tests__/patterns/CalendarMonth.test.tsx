import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CalendarMonth } from "../../patterns/CalendarMonth";

describe("CalendarMonth", () => {
  it("renders the month grid", () => {
    const { container } = render(
      <CalendarMonth month={new Date(2026, 4, 1)} />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
