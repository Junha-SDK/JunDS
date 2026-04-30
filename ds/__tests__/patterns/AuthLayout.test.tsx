import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AuthLayout } from "../../patterns/AuthLayout";

describe("AuthLayout", () => {
  it("renders", () => {
    const { container } = render(<AuthLayout data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
