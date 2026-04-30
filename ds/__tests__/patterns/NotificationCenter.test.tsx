import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NotificationCenter } from "../../patterns/NotificationCenter";

describe("NotificationCenter", () => {
  it("renders without throwing", () => {
    const { container } = render(<NotificationCenter notifications={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
