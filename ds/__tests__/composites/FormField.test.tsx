import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormField } from "../../composites/FormField";
import { Input } from "../../primitives/Input";

describe("FormField", () => {
  it("renders without throwing", () => {
    const { container } = render(<FormField>{null}</FormField>);
    expect(container.firstChild).toBeDefined();
  });

  it("automatically connects the label to a single input", () => {
    render(
      <FormField label="이름">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText("이름");
    expect(input).toHaveAttribute("id");
    expect(input.id).not.toBe("");
  });

  it("automatically connects required and error semantics", () => {
    render(
      <FormField label="이메일" required error="올바른 이메일을 입력하세요.">
        <Input />
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: /이메일/ });
    const error = screen.getByRole("alert");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("border-danger");
    expect(input).toHaveAttribute("aria-errormessage", error.id);
    expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(error.id);
  });

  it("preserves an existing id and description when adding a hint", () => {
    render(
      <>
        <p id="external-description">외부 설명</p>
        <FormField label="검색" hint="이름 또는 이메일을 입력하세요.">
          <Input id="search-input" aria-describedby="external-description" />
        </FormField>
      </>,
    );

    const input = screen.getByLabelText("검색");
    const hint = screen.getByText("이름 또는 이메일을 입력하세요.");
    expect(input).toHaveAttribute("id", "search-input");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toEqual(
      expect.arrayContaining(["external-description", hint.id]),
    );
  });

  it("uses htmlFor without mutating multi-child content", () => {
    render(
      <FormField label="기간" htmlFor="start-date">
        <Input id="start-date" aria-label="시작일" />
        <Input id="end-date" aria-label="종료일" />
      </FormField>,
    );

    expect(screen.getByText("기간")).toHaveAttribute("for", "start-date");
    expect(screen.getByLabelText("시작일")).not.toHaveAttribute("aria-required");
    expect(screen.getByLabelText("종료일")).not.toHaveAttribute("aria-required");
  });
});
