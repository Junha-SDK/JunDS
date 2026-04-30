import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Input } from "../../primitives/Input";

describe("Input a11y", () => {
  it("renders as a textbox", () => {
    render(<Input placeholder="email" />);
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("respects type=password (no longer a textbox)", () => {
    render(<Input type="password" placeholder="password" />);
    // password inputs are not exposed as textbox role
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByPlaceholderText("password")).toHaveProperty("type", "password");
  });

  it("forwards disabled attribute", () => {
    render(<Input disabled placeholder="x" />);
    expect(screen.getByPlaceholderText("x")).toBeDisabled();
  });

  it("accepts keyboard input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="x" />);
    const el = screen.getByRole("textbox");
    await user.type(el, "hello");
    expect(el).toHaveValue("hello");
  });
});
