import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PasswordStrength } from "../../composites/PasswordStrength";

describe("PasswordStrength", () => {
  it("renders", () => {
    const { container } = render(<PasswordStrength password="Abc123" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
