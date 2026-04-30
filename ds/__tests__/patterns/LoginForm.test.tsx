import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoginForm } from "../../patterns/LoginForm";

describe("LoginForm", () => {
  it("renders without throwing", () => {
    const { container } = render(<LoginForm onSubmit={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
