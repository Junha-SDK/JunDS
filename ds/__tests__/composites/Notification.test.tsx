import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Notification } from "../../composites/Notification";

describe("Notification", () => {
  it("renders without throwing", () => {
    const { container } = render(<Notification title="" />);
    expect(container.firstChild).toBeDefined();
  });
});
