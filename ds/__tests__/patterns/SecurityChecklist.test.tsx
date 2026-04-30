import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SecurityChecklist } from "../../patterns/SecurityChecklist";

describe("SecurityChecklist", () => {
  it("renders without throwing", () => {
    const { container } = render(<SecurityChecklist items={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
