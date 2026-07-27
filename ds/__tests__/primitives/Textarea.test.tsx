import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Textarea } from "../../primitives/Textarea";

describe("Textarea", () => {
  it("renders without throwing", () => {
    const { container } = render(<Textarea />);
    expect(container.firstChild).toBeDefined();
  });

  it("exposes the error state to assistive technology", () => {
    render(<Textarea error aria-label="설명" />);
    expect(screen.getByLabelText("설명")).toHaveAttribute("aria-invalid", "true");
  });

  it("counts uncontrolled text and connects the counter description", async () => {
    const user = userEvent.setup();
    render(
      <>
        <p id="description">최대 다섯 글자</p>
        <Textarea
          aria-label="소개"
          aria-describedby="description"
          defaultValue="안녕"
          maxLength={5}
          showCount
        />
      </>,
    );

    const textarea = screen.getByLabelText("소개");
    const counter = screen.getByText("2/5");
    expect(textarea.getAttribute("aria-describedby")?.split(" ")).toEqual(
      expect.arrayContaining(["description", counter.id]),
    );

    await user.type(textarea, "하");
    expect(screen.getByText("3/5")).toBeInTheDocument();
  });

  it("shows a zero maxLength counter", () => {
    render(<Textarea aria-label="비어 있음" maxLength={0} showCount />);
    expect(screen.getByText("0/0")).toBeInTheDocument();
  });
});
