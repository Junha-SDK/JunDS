import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Tour } from "../../patterns/Tour";

describe("Tour", () => {
  it("renders without throwing", () => {
    const { container } = render(<Tour steps={[]} open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
